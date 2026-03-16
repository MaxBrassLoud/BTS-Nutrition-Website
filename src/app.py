import json
import os
from flask import Flask, render_template, jsonify, request, abort

app = Flask(__name__)

BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
PRODUCTS_DIR = os.path.join(BASE_DIR, "products")
BLOG_DIR     = os.path.join(BASE_DIR, "blog")

# Auto-create folders
os.makedirs(PRODUCTS_DIR, exist_ok=True)
os.makedirs(BLOG_DIR, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "static", "assets"), exist_ok=True)
for cat in ["protein", "pre-workout", "vitamins", "recovery"]:
    os.makedirs(os.path.join(PRODUCTS_DIR, cat), exist_ok=True)

CATEGORY_META = {
    "protein":      {"label": "Protein",     "icon": "💪", "color": "#e8ff00"},
    "pre-workout":  {"label": "Pre-Workout",  "icon": "⚡", "color": "#ff4d1c"},
    "vitamins":     {"label": "Vitamine",     "icon": "🌿", "color": "#00e5b0"},
    "recovery":     {"label": "Recovery",     "icon": "🔄", "color": "#a78bfa"},
}


# ── Products ─────────────────────────────────────────
def load_products(category=None):
    products = []
    categories = [category] if category else os.listdir(PRODUCTS_DIR)
    for cat in categories:
        cat_path = os.path.join(PRODUCTS_DIR, cat)
        if not os.path.isdir(cat_path):
            continue
        for filename in sorted(os.listdir(cat_path)):
            if filename.endswith(".json"):
                with open(os.path.join(cat_path, filename), "r", encoding="utf-8") as f:
                    p = json.load(f)
                    p["category"]      = cat
                    p["category_meta"] = CATEGORY_META.get(cat, {})
                    products.append(p)
    return products


def get_product_by_id(product_id):
    for p in load_products():
        if p.get("id") == product_id:
            return p
    return None


# ── Blog ─────────────────────────────────────────────
def load_posts(limit=None):
    """Load all blog posts sorted by date descending."""
    posts = []
    if not os.path.isdir(BLOG_DIR):
        return posts
    for filename in os.listdir(BLOG_DIR):
        if filename.endswith(".json"):
            filepath = os.path.join(BLOG_DIR, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                post = json.load(f)
                posts.append(post)
    # Sort newest first
    posts.sort(key=lambda x: x.get("date", ""), reverse=True)
    if limit:
        return posts[:limit]
    return posts


def get_post_by_id(post_id):
    filepath = os.path.join(BLOG_DIR, f"{post_id}.json")
    if not os.path.isfile(filepath):
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


# ── Page routes ───────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/blog")
def blog():
    posts = load_posts()
    featured = next((p for p in posts if p.get("featured")), posts[0] if posts else None)
    rest = [p for p in posts if not p.get("featured")]
    return render_template("blog.html", posts=posts, featured=featured, rest=rest)

@app.route("/blog/<post_id>")
def blog_post(post_id):
    post = get_post_by_id(post_id)
    if not post:
        abort(404)
    all_posts = load_posts()
    # Related posts: same category, exclude current
    related = [p for p in all_posts if p["id"] != post_id and p.get("category") == post.get("category")][:3]
    if len(related) < 3:
        related += [p for p in all_posts if p["id"] != post_id and p not in related]
    related = related[:3]
    return render_template("blog_post.html", post=post, related=related)

@app.route("/cart")
def cart():
    return render_template("cart.html")

@app.route("/produkt/<product_id>")
def product_detail(product_id):
    p = get_product_by_id(product_id)
    if not p:
        abort(404)
    return render_template("product.html", product=p)

@app.route("/impressum")
def impressum():
    return render_template("impressum.html")

@app.route("/datenschutz")
def datenschutz():
    return render_template("datenschutz.html")

@app.route("/agb")
def agb():
    return render_template("agb.html")


# ── API routes ────────────────────────────────────────
@app.route("/api/products")
def api_products():
    category = request.args.get("category")
    search   = request.args.get("search", "").lower()
    sort     = request.args.get("sort", "default")
    products = load_products(category)
    if search:
        products = [p for p in products if
            search in p["name"].lower() or
            search in p.get("description", "").lower() or
            any(search in t.lower() for t in p.get("tags", []))]
    if sort == "price-asc":    products.sort(key=lambda x: x["price"])
    elif sort == "price-desc": products.sort(key=lambda x: x["price"], reverse=True)
    elif sort == "rating":     products.sort(key=lambda x: x["rating"], reverse=True)
    return jsonify({"products": products, "total": len(products)})

@app.route("/api/products/<product_id>")
def api_product(product_id):
    p = get_product_by_id(product_id)
    if not p:
        return jsonify({"error": "not found"}), 404
    return jsonify(p)

@app.route("/api/categories")
def api_categories():
    result = []
    for key, meta in CATEGORY_META.items():
        result.append({"id": key, **meta, "count": len(load_products(key))})
    return jsonify(result)

@app.route("/api/blog")
def api_blog():
    limit = request.args.get("limit", type=int)
    posts = load_posts(limit=limit)
    # Strip full content for listing
    summary = [{k: v for k, v in p.items() if k != "content"} for p in posts]
    return jsonify({"posts": summary, "total": len(summary)})


# ── Error handlers ────────────────────────────────────
@app.errorhandler(404)
def error_404(e):
    return render_template("errors/404.html"), 404

@app.errorhandler(403)
def error_403(e):
    return render_template("errors/403.html"), 403

@app.errorhandler(500)
def error_500(e):
    return render_template("errors/500.html"), 500

@app.errorhandler(429)
def error_429(e):
    return render_template("errors/429.html"), 429


if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0")