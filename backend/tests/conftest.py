import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models import Product

TEST_DATABASE_URL = "sqlite:///./test_shoplite.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture()
def db():
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def sample_product(db) -> Product:
    product = Product(
        name="Wireless Headphones",
        description="Premium noise-cancelling headphones",
        price=299.99,
        image_url="https://example.com/headphones.jpg",
        category="Electronics",
        stock=50,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@pytest.fixture()
def second_product(db) -> Product:
    product = Product(
        name="Mechanical Keyboard",
        description="Clicky RGB mechanical keyboard",
        price=149.99,
        image_url="https://example.com/keyboard.jpg",
        category="Electronics",
        stock=30,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product
