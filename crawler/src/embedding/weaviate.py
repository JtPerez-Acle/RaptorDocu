"""
Weaviate vector database client for storing and retrieving document embeddings.
"""

import logging
import uuid
from typing import Any, Dict, List, Optional, Tuple

import weaviate
from weaviate.util import generate_uuid5

from src.utils.config import Settings

logger = logging.getLogger(__name__)

# Define the class name for documentation objects in Weaviate
DOC_CLASS_NAME = "Documentation"


class WeaviateClient:
    """
    Client for interacting with Weaviate vector database.
    
    Attributes:
        settings: Application settings
        client: Weaviate client
    """
    
    def __init__(self, settings: Settings):
        """
        Initialize the Weaviate client.
        
        Args:
            settings: Application settings
        """
        self.settings = settings
        
        # Configure auth if Weaviate API key is provided
        auth_config = None
        if settings.weaviate_api_key:
            auth_config = weaviate.AuthApiKey(api_key=settings.weaviate_api_key)
        
        # Initialize the client
        try:
            self.client = weaviate.Client(
                url=settings.weaviate_url,
                auth_client_secret=auth_config,
                additional_headers={
                    "X-OpenAI-Api-Key": settings.openai_api_key,
                },
            )
            logger.info(f"Connected to Weaviate at {settings.weaviate_url}")
            
            # Ensure schema exists
            self._ensure_schema()
        except Exception as e:
            logger.error(f"Failed to connect to Weaviate: {str(e)}")
            raise
    
    def _ensure_schema(self) -> None:
        """
        Ensure the required schema exists in Weaviate.
        
        Creates the Documentation class if it doesn't exist.
        """
        # Check if the class already exists
        class_exists = self.client.schema.exists(DOC_CLASS_NAME)
        
        if not class_exists:
            # Define the Documentation class
            class_obj = {
                "class": DOC_CLASS_NAME,
                "description": "Documentation content with embeddings",
                "vectorizer": "text2vec-transformers",  # Using the transformer vectorizer
                "moduleConfig": {
                    "text2vec-transformers": {
                        "poolingStrategy": "masked_mean",
                        "vectorizeClassName": False,
                    }
                },
                "properties": [
                    {
                        "name": "content",
                        "description": "The documentation content",
                        "dataType": ["text"],
                        "moduleConfig": {
                            "text2vec-transformers": {
                                "skip": False,
                                "vectorizePropertyName": False,
                            }
                        },
                    },
                    {
                        "name": "title",
                        "description": "The title of the documentation",
                        "dataType": ["string"],
                        "moduleConfig": {
                            "text2vec-transformers": {
                                "skip": False,
                                "vectorizePropertyName": False,
                            }
                        },
                    },
                    {
                        "name": "url",
                        "description": "The URL of the documentation",
                        "dataType": ["string"],
                        "moduleConfig": {
                            "text2vec-transformers": {
                                "skip": True,
                            }
                        },
                    },
                    {
                        "name": "source",
                        "description": "The source of the documentation",
                        "dataType": ["string"],
                        "moduleConfig": {
                            "text2vec-transformers": {
                                "skip": True,
                            }
                        },
                    },
                    {
                        "name": "version",
                        "description": "The version of the documentation",
                        "dataType": ["string"],
                        "moduleConfig": {
                            "text2vec-transformers": {
                                "skip": True,
                            }
                        },
                    },
                ],
            }
            
            # Create the class
            self.client.schema.create_class(class_obj)
            logger.info(f"Created {DOC_CLASS_NAME} class in Weaviate")
    
    def add_document(
        self, content: str, metadata: Dict[str, str] = None
    ) -> Tuple[str, str]:
        """
        Add a document to Weaviate.
        
        Args:
            content: Document content
            metadata: Optional metadata
            
        Returns:
            Tuple[str, str]: Document ID and Weaviate object ID
        """
        if metadata is None:
            metadata = {}
        
        # Generate a deterministic UUID based on content
        doc_id = str(uuid.uuid4())
        weaviate_id = generate_uuid5(content)
        
        # Prepare the document object
        doc_obj = {
            "content": content,
            "title": metadata.get("title", "Untitled Document"),
            "url": metadata.get("url", ""),
            "source": metadata.get("source", ""),
            "version": metadata.get("version", "latest"),
        }
        
        # Add the document to Weaviate
        try:
            self.client.data_object.create(
                data_object=doc_obj,
                class_name=DOC_CLASS_NAME,
                uuid=weaviate_id,
            )
            logger.info(f"Added document to Weaviate with ID: {weaviate_id}")
            
            return doc_id, weaviate_id
        except Exception as e:
            logger.error(f"Failed to add document to Weaviate: {str(e)}")
            raise
    
    def search_similar(
        self,
        query: str,
        limit: int = 10,
        filters: Optional[Dict[str, str]] = None,
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Search for similar documents in Weaviate.
        
        Args:
            query: Search query
            limit: Maximum number of results
            filters: Optional filters
            
        Returns:
            Tuple[List[Dict[str, Any]], int]: List of results and total count
        """
        try:
            # Build the query
            query_builder = (
                self.client.query.get(DOC_CLASS_NAME, ["content", "title", "url", "source", "version"])
                .with_near_text({"concepts": [query]})
                .with_limit(limit)
            )
            
            # Add filters if provided
            if filters:
                where_filter = {}
                
                for key, value in filters.items():
                    # Add filter for each metadata field
                    if key in ["title", "url", "source", "version"]:
                        where_filter[key] = {"operator": "Equal", "valueString": value}
                
                if where_filter:
                    query_builder = query_builder.with_where(where_filter)
            
            # Execute the query
            result = query_builder.do()
            
            # Extract the results
            if "data" in result and "Get" in result["data"] and DOC_CLASS_NAME in result["data"]["Get"]:
                docs = result["data"]["Get"][DOC_CLASS_NAME]
                total = len(docs)
                
                # Transform the results
                transformed_results = []
                for i, doc in enumerate(docs):
                    transformed_results.append({
                        "id": str(doc["_additional"]["id"]),
                        "content": doc["content"],
                        "metadata": {
                            "title": doc["title"],
                            "url": doc.get("url", ""),
                            "source": doc.get("source", ""),
                            "version": doc.get("version", "latest"),
                        },
                        "score": doc["_additional"]["certainty"] if "_additional" in doc and "certainty" in doc["_additional"] else 0.0,
                    })
                
                return transformed_results, total
            else:
                return [], 0
        except Exception as e:
            logger.error(f"Failed to search in Weaviate: {str(e)}")
            raise
    
    def delete_document(self, weaviate_id: str) -> bool:
        """
        Delete a document from Weaviate.
        
        Args:
            weaviate_id: Weaviate object ID
            
        Returns:
            bool: True if successful
        """
        try:
            self.client.data_object.delete(
                uuid=weaviate_id,
                class_name=DOC_CLASS_NAME,
            )
            logger.info(f"Deleted document from Weaviate with ID: {weaviate_id}")
            
            return True
        except Exception as e:
            logger.error(f"Failed to delete document from Weaviate: {str(e)}")
            raise
    
    def batch_add_documents(
        self, documents: List[Dict[str, Any]]
    ) -> List[Tuple[str, str]]:
        """
        Add multiple documents to Weaviate in a batch.
        
        Args:
            documents: List of document objects with content and metadata
            
        Returns:
            List[Tuple[str, str]]: List of document IDs and Weaviate IDs
        """
        results = []
        
        try:
            # Create a batch process
            with self.client.batch as batch:
                # Configure batch
                batch.batch_size = 100
                
                # Add each document to the batch
                for doc in documents:
                    content = doc["content"]
                    metadata = doc.get("metadata", {})
                    
                    doc_id = str(uuid.uuid4())
                    weaviate_id = generate_uuid5(content)
                    
                    doc_obj = {
                        "content": content,
                        "title": metadata.get("title", "Untitled Document"),
                        "url": metadata.get("url", ""),
                        "source": metadata.get("source", ""),
                        "version": metadata.get("version", "latest"),
                    }
                    
                    batch.add_data_object(
                        data_object=doc_obj,
                        class_name=DOC_CLASS_NAME,
                        uuid=weaviate_id,
                    )
                    
                    results.append((doc_id, weaviate_id))
            
            logger.info(f"Added {len(documents)} documents to Weaviate in batch")
            
            return results
        except Exception as e:
            logger.error(f"Failed to add documents to Weaviate in batch: {str(e)}")
            raise