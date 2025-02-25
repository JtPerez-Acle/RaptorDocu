"""
RAPTOR (Recursive Abstractive Processing and Thematic Organization for Retrieval) implementation.

This module provides the core RAPTOR processing logic for generating hierarchical
summaries of documentation content.
"""

import json
import logging
import uuid
from typing import Any, Dict, List, Optional, Tuple

import httpx

from src.utils.config import Settings

logger = logging.getLogger(__name__)


class RAPTORProcessor:
    """
    Core RAPTOR processor for hierarchical summarization.
    
    Attributes:
        settings: Application settings
        openai_api_key: OpenAI API key
    """
    
    def __init__(self, settings: Settings):
        """
        Initialize the RAPTOR processor.
        
        Args:
            settings: Application settings
        """
        self.settings = settings
        self.openai_api_key = settings.openai_api_key
        self.client = httpx.AsyncClient(
            timeout=120.0,
            headers={
                "Authorization": f"Bearer {self.openai_api_key}",
                "Content-Type": "application/json",
            },
        )
    
    async def generate_summary(
        self, documents: List[str], max_tokens: int = 1000, hierarchy_levels: int = 3
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Generate a hierarchical summary using RAPTOR.
        
        Args:
            documents: List of document contents
            max_tokens: Maximum tokens for the summary
            hierarchy_levels: Number of hierarchy levels
            
        Returns:
            Tuple[str, Dict[str, Any]]: Summary ID and summary data
        """
        try:
            # Generate a unique ID for this summary
            summary_id = str(uuid.uuid4())
            
            # Combine documents for initial processing
            combined_text = "\n\n".join(documents)
            
            # Generate the top-level summary
            top_summary = await self._generate_level_summary(
                combined_text, max_tokens=max_tokens, level=1
            )
            
            # Initialize hierarchical structure
            hierarchical_summary = {
                "level": 1,
                "content": top_summary,
                "children": [],
            }
            
            # Generate lower-level summaries recursively
            if hierarchy_levels > 1:
                await self._generate_hierarchical_summaries(
                    hierarchical_summary, 
                    documents, 
                    max_tokens,
                    current_level=1, 
                    max_levels=hierarchy_levels
                )
            
            # Create the complete summary data
            summary_data = {
                "id": summary_id,
                "summary": top_summary,
                "hierarchical_summary": hierarchical_summary,
                "document_count": len(documents),
            }
            
            logger.info(f"Generated RAPTOR summary with ID: {summary_id}")
            
            return summary_id, summary_data
        except Exception as e:
            logger.error(f"Failed to generate RAPTOR summary: {str(e)}")
            raise
    
    async def _generate_level_summary(
        self, text: str, max_tokens: int = 1000, level: int = 1
    ) -> str:
        """
        Generate a summary for a specific level.
        
        Args:
            text: Text to summarize
            max_tokens: Maximum tokens for the summary
            level: Current hierarchy level
            
        Returns:
            str: Generated summary
        """
        # Adjust prompt based on level
        if level == 1:
            prompt = f"""Summarize the following documentation content in a detailed, well-structured summary.
Focus on preserving the most important technical information, including API details, parameters, and concepts.
Organize the information in a way that makes it easy to understand and reference.

Text to summarize:
{text}

Summary:"""
        else:
            prompt = f"""Create a more detailed and specific summary of the following documentation content,
focusing on technical details, API specifications, parameter descriptions, and usage examples.
Organize the information hierarchically with clear sections and subsections.

Text to summarize:
{text}

Detailed summary:"""
        
        try:
            # Call OpenAI API
            response = await self.client.post(
                "https://api.openai.com/v1/chat/completions",
                json={
                    "model": "gpt-4o",
                    "messages": [
                        {"role": "system", "content": "You are a technical documentation assistant specializing in creating clear, accurate, and comprehensive summaries of technical documentation."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": max_tokens,
                    "temperature": 0.3,
                },
            )
            response.raise_for_status()
            
            result = response.json()
            summary = result["choices"][0]["message"]["content"].strip()
            
            return summary
        except Exception as e:
            logger.error(f"Error generating level {level} summary: {str(e)}")
            raise
    
    async def _extract_topics(self, text: str, max_topics: int = 5) -> List[str]:
        """
        Extract main topics from text for hierarchical organization.
        
        Args:
            text: Text to extract topics from
            max_topics: Maximum number of topics to extract
            
        Returns:
            List[str]: List of main topics
        """
        prompt = f"""Analyze the following documentation content and identify the {max_topics} most important
distinct topics or sections that should be explored in more detail. Return ONLY a JSON array of strings
with each topic name, without any additional text or explanation.

Text to analyze:
{text}

Topics (JSON array only):"""
        
        try:
            # Call OpenAI API
            response = await self.client.post(
                "https://api.openai.com/v1/chat/completions",
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": "You are a technical documentation assistant specializing in identifying and organizing key topics in technical documentation."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 400,
                    "temperature": 0.2,
                },
            )
            response.raise_for_status()
            
            result = response.json()
            topics_text = result["choices"][0]["message"]["content"].strip()
            
            # Extract JSON array
            try:
                # Try to parse the entire response as JSON
                topics = json.loads(topics_text)
                if not isinstance(topics, list):
                    # If not a list, try to find and parse a JSON array in the text
                    import re
                    json_pattern = r'\[.*\]'
                    match = re.search(json_pattern, topics_text, re.DOTALL)
                    if match:
                        topics = json.loads(match.group(0))
                    else:
                        # Fallback to splitting by lines and cleaning up
                        topics = [line.strip().strip('",') for line in topics_text.split('\n') if line.strip()]
            except json.JSONDecodeError:
                # Fallback to splitting by lines and cleaning up
                topics = [line.strip().strip('",') for line in topics_text.split('\n') if line.strip()]
            
            # Ensure we have a list of strings
            topics = [str(topic) for topic in topics if topic][:max_topics]
            
            return topics
        except Exception as e:
            logger.error(f"Error extracting topics: {str(e)}")
            raise
    
    async def _extract_content_for_topic(
        self, topic: str, documents: List[str]
    ) -> str:
        """
        Extract content related to a specific topic from documents.
        
        Args:
            topic: Topic to extract content for
            documents: List of document contents
            
        Returns:
            str: Extracted content relevant to the topic
        """
        combined_text = "\n\n".join(documents)
        
        prompt = f"""Extract all content related to the topic "{topic}" from the following documentation.
Include all relevant information, examples, parameters, and technical details about this specific topic.
Maintain the original structure and technical accuracy of the content.

Documentation:
{combined_text}

Content about "{topic}":"""
        
        try:
            # Call OpenAI API
            response = await self.client.post(
                "https://api.openai.com/v1/chat/completions",
                json={
                    "model": "gpt-4o",
                    "messages": [
                        {"role": "system", "content": "You are a technical documentation assistant specializing in extracting and organizing relevant information on specific topics from technical documentation."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 1500,
                    "temperature": 0.2,
                },
            )
            response.raise_for_status()
            
            result = response.json()
            extracted_content = result["choices"][0]["message"]["content"].strip()
            
            return extracted_content
        except Exception as e:
            logger.error(f"Error extracting content for topic '{topic}': {str(e)}")
            raise
    
    async def _generate_hierarchical_summaries(
        self,
        parent_node: Dict[str, Any],
        documents: List[str],
        max_tokens: int,
        current_level: int,
        max_levels: int,
    ) -> None:
        """
        Recursively generate hierarchical summaries.
        
        Args:
            parent_node: Parent node in the hierarchy
            documents: List of document contents
            max_tokens: Maximum tokens for summaries
            current_level: Current hierarchy level
            max_levels: Maximum hierarchy levels
        """
        if current_level >= max_levels:
            return
        
        # Extract topics from the parent summary
        topics = await self._extract_topics(parent_node["content"])
        
        for topic in topics:
            # Extract content relevant to this topic
            topic_content = await self._extract_content_for_topic(topic, documents)
            
            # Generate summary for this topic
            topic_summary = await self._generate_level_summary(
                topic_content, 
                max_tokens=max_tokens // 2,  # Shorter summaries for lower levels
                level=current_level + 1
            )
            
            # Create node for this topic
            topic_node = {
                "level": current_level + 1,
                "content": topic_summary,
                "topic": topic,
                "children": [],
            }
            
            # Add to parent's children
            parent_node["children"].append(topic_node)
            
            # Recursively generate children if needed
            if current_level + 1 < max_levels:
                await self._generate_hierarchical_summaries(
                    topic_node,
                    documents,
                    max_tokens // 2,  # Further reduce tokens for deeper levels
                    current_level + 1,
                    max_levels,
                )