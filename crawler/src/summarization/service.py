"""
Service for generating and retrieving RAPTOR summaries.
"""

import json
import logging
import os
import uuid
from typing import Any, Dict, List, Optional, Tuple

from src.summarization.raptor import RAPTORProcessor
from src.utils.config import Settings

logger = logging.getLogger(__name__)

# Directory for storing summaries
SUMMARIES_DIR = "data/summaries"


class SummarizationService:
    """
    Service for document summarization using RAPTOR.
    
    Attributes:
        settings: Application settings
        raptor: RAPTOR processor instance
    """
    
    def __init__(self, settings: Settings):
        """
        Initialize the summarization service.
        
        Args:
            settings: Application settings
        """
        self.settings = settings
        self.raptor = RAPTORProcessor(settings)
        
        # Ensure summaries directory exists
        os.makedirs(SUMMARIES_DIR, exist_ok=True)
    
    async def generate_summary(
        self,
        documents: List[str],
        max_tokens: int = 1000,
        hierarchy_levels: int = 3,
    ) -> Tuple[str, str, Dict[str, Any]]:
        """
        Generate a summary using RAPTOR.
        
        Args:
            documents: List of document contents
            max_tokens: Maximum tokens for the summary
            hierarchy_levels: Number of hierarchy levels
            
        Returns:
            Tuple[str, str, Dict[str, Any]]: Summary ID, summary text, and hierarchical summary
        """
        try:
            # Generate summary using RAPTOR
            summary_id, summary_data = await self.raptor.generate_summary(
                documents=documents,
                max_tokens=max_tokens,
                hierarchy_levels=hierarchy_levels,
            )
            
            # Store the summary for later retrieval
            self._store_summary(summary_id, summary_data)
            
            logger.info(f"Generated summary with ID: {summary_id}")
            
            return (
                summary_id,
                summary_data["summary"],
                summary_data["hierarchical_summary"],
            )
        except Exception as e:
            logger.error(f"Failed to generate summary: {str(e)}")
            raise
    
    async def get_summary(self, summary_id: str) -> Dict[str, Any]:
        """
        Retrieve a previously generated summary.
        
        Args:
            summary_id: Summary ID
            
        Returns:
            Dict[str, Any]: Summary data
            
        Raises:
            KeyError: If the summary is not found
        """
        try:
            # Get the summary file path
            summary_path = os.path.join(SUMMARIES_DIR, f"{summary_id}.json")
            
            # Check if the summary exists
            if not os.path.exists(summary_path):
                raise KeyError(f"Summary with ID {summary_id} not found")
            
            # Load the summary
            with open(summary_path, "r") as f:
                summary_data = json.load(f)
            
            logger.info(f"Retrieved summary with ID: {summary_id}")
            
            return summary_data
        except Exception as e:
            if isinstance(e, KeyError):
                raise
            
            logger.error(f"Failed to retrieve summary: {str(e)}")
            raise
    
    def _store_summary(self, summary_id: str, summary_data: Dict[str, Any]) -> None:
        """
        Store a summary for later retrieval.
        
        Args:
            summary_id: Summary ID
            summary_data: Summary data
        """
        try:
            # Get the summary file path
            summary_path = os.path.join(SUMMARIES_DIR, f"{summary_id}.json")
            
            # Store the summary
            with open(summary_path, "w") as f:
                json.dump(summary_data, f, indent=2)
            
            logger.info(f"Stored summary with ID: {summary_id}")
        except Exception as e:
            logger.error(f"Failed to store summary: {str(e)}")
            raise
    
    async def list_summaries(self) -> List[Dict[str, Any]]:
        """
        List all available summaries.
        
        Returns:
            List[Dict[str, Any]]: List of summary metadata
        """
        try:
            summaries = []
            
            # Get all summary files
            summary_files = [f for f in os.listdir(SUMMARIES_DIR) if f.endswith(".json")]
            
            # Load metadata for each summary
            for summary_file in summary_files:
                summary_id = summary_file.replace(".json", "")
                
                try:
                    summary_data = await self.get_summary(summary_id)
                    
                    # Add basic metadata to the list
                    summaries.append({
                        "id": summary_id,
                        "document_count": summary_data.get("document_count", 0),
                        "created_at": summary_data.get("created_at", ""),
                    })
                except Exception as e:
                    logger.warning(f"Error loading summary {summary_id}: {str(e)}")
            
            return summaries
        except Exception as e:
            logger.error(f"Failed to list summaries: {str(e)}")
            raise
    
    async def delete_summary(self, summary_id: str) -> bool:
        """
        Delete a summary.
        
        Args:
            summary_id: Summary ID
            
        Returns:
            bool: True if successful
            
        Raises:
            KeyError: If the summary is not found
        """
        try:
            # Get the summary file path
            summary_path = os.path.join(SUMMARIES_DIR, f"{summary_id}.json")
            
            # Check if the summary exists
            if not os.path.exists(summary_path):
                raise KeyError(f"Summary with ID {summary_id} not found")
            
            # Delete the summary
            os.remove(summary_path)
            
            logger.info(f"Deleted summary with ID: {summary_id}")
            
            return True
        except Exception as e:
            if isinstance(e, KeyError):
                raise
            
            logger.error(f"Failed to delete summary: {str(e)}")
            raise