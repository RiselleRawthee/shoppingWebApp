# SL-17: Product reviews and star ratings
# These are executable acceptance criteria — all marked xfail until implemented.
# When the feature is complete, every test below should pass (remove xfail markers).

import pytest


# ── AC1: POST /products/{id}/reviews — happy path ───────────────────────────

@pytest.mark.xfail(reason="SL-17 not implemented", strict=True)
def test_submit_review_returns_201(client, sample_product):
    response = client.post(
        f"/products/{sample_product.id}/reviews",
        json={"rating": 5, "comment": "Excellent product!", "reviewer_name": "Alice"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["rating"] == 5
    assert data["comment"] == "Excellent product!"
    assert data["reviewer_name"] == "Alice"
    assert data["product_id"] == sample_product.id


# ── AC2: GET /products/{id}/reviews — list with average ─────────────────────

@pytest.mark.xfail(reason="SL-17 not implemented", strict=True)
def test_get_reviews_returns_list_and_average(client, sample_product):
    client.post(
        f"/products/{sample_product.id}/reviews",
        json={"rating": 4, "comment": "Pretty good", "reviewer_name": "Bob"},
    )
    client.post(
        f"/products/{sample_product.id}/reviews",
        json={"rating": 2, "comment": "Not great", "reviewer_name": "Carol"},
    )
    response = client.get(f"/products/{sample_product.id}/reviews")
    assert response.status_code == 200
    data = response.json()
    assert data["total_reviews"] == 2
    assert data["average_rating"] == 3.0
    assert len(data["reviews"]) == 2


# ── AC3: Duplicate review returns 409 ────────────────────────────────────────

@pytest.mark.xfail(reason="SL-17 not implemented", strict=True)
def test_duplicate_review_returns_409(client, sample_product):
    client.post(
        f"/products/{sample_product.id}/reviews",
        json={"rating": 5, "comment": "Love it", "reviewer_name": "Alice"},
    )
    response = client.post(
        f"/products/{sample_product.id}/reviews",
        json={"rating": 3, "comment": "Changed my mind", "reviewer_name": "Alice"},
    )
    assert response.status_code == 409


# ── AC4a: Rating below 1 returns 422 ─────────────────────────────────────────

@pytest.mark.xfail(reason="SL-17 not implemented", strict=True)
def test_rating_below_minimum_returns_422(client, sample_product):
    response = client.post(
        f"/products/{sample_product.id}/reviews",
        json={"rating": 0, "reviewer_name": "Dave"},
    )
    assert response.status_code == 422


# ── AC4b: Rating above 5 returns 422 ─────────────────────────────────────────

@pytest.mark.xfail(reason="SL-17 not implemented", strict=True)
def test_rating_above_maximum_returns_422(client, sample_product):
    response = client.post(
        f"/products/{sample_product.id}/reviews",
        json={"rating": 6, "reviewer_name": "Eve"},
    )
    assert response.status_code == 422


# ── AC5: Product not found returns 404 ───────────────────────────────────────

@pytest.mark.xfail(reason="SL-17 not implemented", strict=True)
def test_review_on_nonexistent_product_returns_404(client):
    response = client.post(
        "/products/99999/reviews",
        json={"rating": 4, "reviewer_name": "Frank"},
    )
    assert response.status_code == 404


# ── AC6: GET reviews for product with no reviews ─────────────────────────────

@pytest.mark.xfail(reason="SL-17 not implemented", strict=True)
def test_get_reviews_empty_product(client, sample_product):
    response = client.get(f"/products/{sample_product.id}/reviews")
    assert response.status_code == 200
    data = response.json()
    assert data["total_reviews"] == 0
    assert data["average_rating"] == 0.0
    assert data["reviews"] == []


# ── AC7: Comment is optional ──────────────────────────────────────────────────

@pytest.mark.xfail(reason="SL-17 not implemented", strict=True)
def test_review_without_comment_is_valid(client, sample_product):
    response = client.post(
        f"/products/{sample_product.id}/reviews",
        json={"rating": 3, "reviewer_name": "Grace"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["comment"] is None
