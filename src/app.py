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


# ── Products ─────────────────────────────────────────
def load_products():
    """Load all products (max 5 expected, no categories)."""
    products = []
    if not os.path.isdir(PRODUCTS_DIR):
        return products
    for filename in sorted(os.listdir(PRODUCTS_DIR)):
        if filename.endswith(".json"):
            with open(os.path.join(PRODUCTS_DIR, filename), "r", encoding="utf-8") as f:
                p = json.load(f)
                products.append(p)
    return products[:5]  # Max 5 products


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
    products = load_products()
    featured = products[0] if products else None
    return render_template("index.html", products=products, featured=featured)

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
    related = [p for p in all_posts if p["id"] != post_id][:3]
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
    """Simple API: return all products (no filtering/search)."""
    products = load_products()
    return jsonify({"products": products, "total": len(products)})

@app.route("/api/products/<product_id>")
def api_product(product_id):
    p = get_product_by_id(product_id)
    if not p:
        return jsonify({"error": "not found"}), 404
    return jsonify(p)

@app.route("/api/blog")
def api_blog():
    limit = request.args.get("limit", type=int)
    posts = load_posts(limit=limit)
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