"""Tests for the health check endpoint."""

from fastapi.testclient import TestClient


def test_health_check(client: TestClient) -> None:
    """
    Test the health check endpoint.
    
    Args:
        client: Test client
    """
    response = client.get("/health")
    
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "version" in response.json()
    assert "environment" in response.json()