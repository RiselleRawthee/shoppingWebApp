SESSION_ID = "test-session-abc123"


def test_get_cart_empty(client):
    response = client.get(f"/cart/{SESSION_ID}")
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total_price"] == 0.0
    assert data["item_count"] == 0


def test_add_item_to_cart(client, sample_product):
    response = client.post(
        "/cart",
        json={"product_id": sample_product.id, "quantity": 1, "session_id": SESSION_ID},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["product_id"] == sample_product.id
    assert data["quantity"] == 1
    assert data["session_id"] == SESSION_ID


def test_add_same_product_increments_quantity(client, sample_product):
    client.post(
        "/cart",
        json={"product_id": sample_product.id, "quantity": 1, "session_id": SESSION_ID},
    )
    client.post(
        "/cart",
        json={"product_id": sample_product.id, "quantity": 2, "session_id": SESSION_ID},
    )
    response = client.get(f"/cart/{SESSION_ID}")
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 3


def test_cart_total_price_calculated_correctly(client, sample_product):
    client.post(
        "/cart",
        json={"product_id": sample_product.id, "quantity": 2, "session_id": SESSION_ID},
    )
    response = client.get(f"/cart/{SESSION_ID}")
    data = response.json()
    assert data["total_price"] == round(sample_product.price * 2, 2)
    assert data["item_count"] == 2


def test_remove_item_from_cart(client, sample_product):
    add_response = client.post(
        "/cart",
        json={"product_id": sample_product.id, "quantity": 1, "session_id": SESSION_ID},
    )
    item_id = add_response.json()["id"]
    response = client.delete(f"/cart/{SESSION_ID}/{item_id}")
    assert response.status_code == 204
    cart = client.get(f"/cart/{SESSION_ID}").json()
    assert cart["items"] == []


def test_remove_nonexistent_item_returns_404(client):
    response = client.delete(f"/cart/{SESSION_ID}/99999")
    assert response.status_code == 404
