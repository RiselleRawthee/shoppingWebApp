# TODO [SL-17]: Implement product reviews and star ratings
#
# This router needs the following endpoints:
#   POST /products/{product_id}/reviews  — submit a review (rating 1-5, optional comment)
#   GET  /products/{product_id}/reviews  — list reviews + average rating
#
# Business rules (from acceptance criteria):
#   - Rating must be an integer between 1 and 5 (422 if invalid)
#   - A reviewer_name can only submit one review per product (409 if duplicate)
#   - GET returns all reviews plus a computed average_rating and total_reviews count
#
# See backend/tests/test_reviews.py for the full executable acceptance criteria.
# See backend/CLAUDE.md for the patterns to follow (schemas, HTTPException codes, etc.).

from fastapi import APIRouter, Response

router = APIRouter()


# Stubs return 501 so all xfail tests genuinely fail until SL-17 is implemented.

@router.post("/{product_id}/reviews")
async def submit_review(product_id: int) -> Response:
    return Response(status_code=501)


@router.get("/{product_id}/reviews")
async def get_reviews(product_id: int) -> Response:
    return Response(status_code=501)
