import React, { useState, useEffect, ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, Search, User, ShoppingBag, X, ChevronRight, ChevronLeft, Plus, Minus, Trash2, LogOut, ArrowLeft, LayoutDashboard, Package, List, ShoppingCart, Save, Edit, Trash, Upload, Zap, Users, MessageCircle, Check } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { supabase } from "./lib/supabase";

// --- Types ---
interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number;
  image_url: string;
  images?: string[];
  category: string;
  badge?: string;
  description?: string;
  is_new?: boolean;
  sizes?: string[];
  colors?: string[];
}

interface Category {
  id: string;
  name: string;
  image_url?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface Order {
  id: string;
  created_at: string;
  customer_email: string;
  phone?: string;
  total: number;
  status: string;
  items: any[];
}

// --- Utilities ---
const getDirectImageUrl = (url: string | undefined | null) => {
  if (!url) return undefined;
  
  // Handle Google Drive links
  if (url.includes('drive.google.com')) {
    let fileId = '';
    
    // Pattern: /file/d/FILE_ID/view
    const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (dMatch) fileId = dMatch[1];
    
    // Pattern: ?id=FILE_ID
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) fileId = idMatch[1];
    
    if (fileId) {
      // Use the most reliable direct link format
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  
  return url;
};

// --- Components ---

const Navbar = ({ 
  cartCount, 
  onOpenCart, 
  user, 
  onOpenAccount,
  categories
}: { 
  cartCount: number; 
  onOpenCart: () => void; 
  user: any; 
  onOpenAccount: () => void;
  categories: Category[];
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-4 md:px-8 py-6",
      isScrolled ? "md:py-4" : "md:py-8"
    )}>
      <div className={cn(
        "max-w-7xl mx-auto flex items-center justify-between px-8 py-4 transition-all duration-700",
        isScrolled ? "glass rounded-[2rem] brand-glow shadow-2xl" : "bg-transparent"
      )}>
        <div className="flex items-center gap-8">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-white hover:text-primary transition-all hover:scale-110 active:scale-95")}>
              <Menu size={22} />
            </SheetTrigger>
            <SheetContent side="left" className="bg-black/95 backdrop-blur-3xl border-r border-white/10 w-full sm:w-[450px] p-0 flex flex-col">
              <div className="flex flex-col h-full pt-32 md:pt-40">
                <div className="flex flex-col gap-8 md:gap-12 px-12 md:px-16">
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-4xl md:text-8xl font-heading font-black tracking-tighter text-foreground hover:text-primary transition-all hover:italic hover:translate-x-4 inline-block"
                  >
                    HOME
                  </Link>
                  <Link
                    to="/products"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-4xl md:text-8xl font-heading font-black tracking-tighter text-foreground hover:text-primary transition-all hover:italic hover:translate-x-4 inline-block"
                  >
                    SHOP
                  </Link>
                  <Link
                    to="/categories"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-4xl md:text-8xl font-heading font-black tracking-tighter text-foreground hover:text-primary transition-all hover:italic hover:translate-x-4 inline-block"
                  >
                    VAULT
                  </Link>
                  {user?.email === "admin@vertexlab@gmail.com" && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-2xl md:text-5xl font-heading font-black tracking-tighter text-primary hover:text-primary/80 transition-all hover:translate-x-4 flex items-center gap-6 mt-12 md:mt-16"
                    >
                      <LayoutDashboard size={32} md:size={48} /> ADMIN
                    </Link>
                  )}
                </div>
                <div className="mt-auto p-12 md:p-16 border-t border-white/5">
                  <p className="text-[10px] md:text-[12px] uppercase tracking-[0.6em] text-white/20 font-black">VERTEX STORE / EST 2024</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/30">
            <Link to="/products" className="hover:text-white transition-all hover:tracking-[0.6em]">Collection</Link>
            <Link to="/categories" className="hover:text-white transition-all hover:tracking-[0.6em]">Taxonomy</Link>
          </div>
        </div>

        <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group">
          <img 
            src="https://i.ibb.co/1frr1Y2p/logo.png" 
            alt="Vertex Store" 
            className="h-12 md:h-16 w-auto object-contain group-hover:scale-125 transition-all duration-700 filter drop-shadow-[0_0_20px_rgba(255,107,0,0.3)]"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "https://ibb.co/1frr1Y2p"; 
            }}
          />
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          <Button variant="ghost" size="icon" className="text-white hover:text-primary transition-all hover:scale-110 hidden md:flex">
            <Search size={22} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:text-primary transition-all hover:scale-110"
            onClick={onOpenAccount}
          >
            <User size={22} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:text-primary transition-all hover:scale-110 relative group/cart"
            onClick={onOpenCart}
          >
            <ShoppingBag size={22} className="text-primary group-hover/cart:scale-110 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center brand-glow animate-pulse">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};

const AllProductsPage = ({ products, loading, onAddToCart }: { products: Product[]; loading: boolean; onAddToCart: (p: Product, q?: number, s?: string, c?: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFilter = queryParams.get('category');

  const filteredProducts = products.filter(p => {
    const categoryName = (p.category || "").trim().toLowerCase();
    const filterValue = (categoryFilter || "").trim().toLowerCase();
    
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         categoryName.includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? categoryName === filterValue : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="px-6 py-32 md:py-48 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-8">
        <div className="space-y-4">
          <span className="text-[10px] tracking-[0.5em] uppercase text-primary font-bold block">
            {categoryFilter ? `Category: ${categoryFilter}` : "Premium Collection"}
          </span>
          <h2 className="text-5xl md:text-8xl font-display tracking-tighter text-white leading-none">
            {categoryFilter ? categoryFilter.toUpperCase() : "ALL"} <span className="text-primary brand-text-glow">{categoryFilter ? "ITEMS" : "PRODUCTS"}</span>
          </h2>
          <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-bold">{filteredProducts.length} Items Found</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text"
            placeholder="SEARCH ARTIFACTS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest text-white focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-[4/5] bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-40 text-center space-y-6">
          <p className="text-white/20 uppercase tracking-[0.5em] text-[10px] font-bold">
            No artifacts found {categoryFilter ? `in ${categoryFilter}` : ""} matching your search
          </p>
          <div className="flex justify-center gap-4">
            {searchQuery && <Button variant="ghost" className="text-primary" onClick={() => setSearchQuery("")}>Clear Search</Button>}
            {categoryFilter && (
              <Link to="/products">
                <Button variant="ghost" className="text-primary">View All Products</Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </section>
  );
};

const CategoriesPage = ({ categories, products }: { categories: Category[]; products: Product[] }) => {
  return (
    <section className="px-6 py-32 md:py-48 max-w-7xl mx-auto min-h-screen">
      <div className="mb-16 md:mb-24 space-y-4">
        <span className="text-[10px] tracking-[0.5em] uppercase text-primary font-bold block">Vertex Taxonomy</span>
        <h1 className="text-4xl md:text-8xl font-display tracking-tighter text-white leading-none">
          BROWSE <span className="text-primary brand-text-glow italic">CATEGORIES</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => {
          const productCount = products.filter(p => (p.category || "").trim().toLowerCase() === category.name.trim().toLowerCase()).length;
          const categoryImage = category.image_url || products.find(p => (p.category || "").trim().toLowerCase() === category.name.trim().toLowerCase())?.image_url || "https://picsum.photos/seed/category/800/1000";
          
          return (
            <Link 
              key={category.id} 
              to={`/products?category=${category.name}`}
              className="group relative aspect-[16/10] overflow-hidden rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all duration-500"
            >
              <img 
                src={getDirectImageUrl(categoryImage)} 
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 space-y-2">
                <h3 className="text-3xl md:text-4xl font-display font-bold tracking-tighter text-white group-hover:text-primary transition-colors italic uppercase">
                  {category.name}
                </h3>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">
                  {productCount} Artifacts
                </p>
              </div>
              <div className="absolute top-6 right-6 h-10 w-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                <ChevronRight size={20} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

const ProductCard = ({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product, q?: number, s?: string, c?: string) => void; key?: string | number }) => {
  const displayImage = (product.images && product.images.length > 0) ? product.images[0] : (product.image_url || undefined);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="group cursor-pointer"
    >
      <Link to={`/product/${product.id}`}>
        <div className="glass-card aspect-[4/5] relative mb-6 overflow-hidden group-hover:brand-glow transition-all duration-700">
          <img 
            src={getDirectImageUrl(displayImage)} 
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
          
          {product.badge && (
            <Badge className="absolute top-6 left-6 primary-gradient text-white text-[9px] font-black tracking-[0.2em] uppercase border-none rounded-full py-1.5 px-4 brand-glow shadow-xl">
              {product.badge}
            </Badge>
          )}

          <div className="absolute bottom-6 left-6 right-6 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-out">
            <Button className="w-full bg-white text-black hover:bg-white/90 rounded-full py-6 text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl">
              Quick View
            </Button>
          </div>
        </div>
      </Link>
      <div className="space-y-3 px-2">
        <div className="flex justify-between items-start gap-4">
          <h4 className="text-white font-heading font-black text-lg md:text-xl tracking-tighter leading-none group-hover:text-primary transition-colors uppercase">
            {product.name}
          </h4>
          <p className="text-primary font-heading font-black text-lg md:text-xl tracking-tighter shrink-0">
            Rs. {product.price.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-black">{product.category}</span>
          <div className="h-[1px] flex-1 bg-white/5" />
        </div>
      </div>
    </motion.div>
  );
};

const HomePage = ({ products, categories, loading, onAddToCart }: { products: Product[]; categories: Category[]; loading: boolean; onAddToCart: (p: Product, q?: number, s?: string, c?: string) => void }) => {
  const featuredProducts = products.slice(0, 8);
  const displayCategories = categories.slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero" 
            className="w-full h-full object-cover opacity-20 scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,0,0.15),transparent_70%)]" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 md:mb-12 space-y-8"
          >
            <span className="text-[12px] md:text-sm tracking-[1em] uppercase text-primary font-black mb-6 block brand-text-glow animate-in fade-in slide-in-from-bottom-4 duration-1000">
              The Future of Style
            </span>
            <h2 className="text-[15vw] md:text-[10vw] font-heading font-black tracking-tighter leading-[0.8] text-white uppercase">
              VERTEX <br />
              <span className="text-primary brand-text-glow italic">LABS</span>
            </h2>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-white/40 text-[11px] md:text-lg tracking-[0.2em] uppercase mt-12 mb-16 max-w-2xl leading-relaxed font-bold text-gradient"
          >
            Premium lifestyle essentials engineered for the modern individual. Quality, style, and innovation in every piece.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
          >
            <Link to="/products" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto primary-gradient text-white hover:scale-105 active:scale-95 rounded-full px-16 md:px-20 py-10 text-[11px] font-black tracking-[0.5em] uppercase brand-glow transition-all duration-500 shadow-[0_20px_50px_rgba(255,107,0,0.2)]">
                Enter Vault
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
          <div className="w-[2px] h-32 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full" />
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-6 py-24 md:py-40 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-8">
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.5em] uppercase text-primary font-bold block">Vertex Taxonomy</span>
            <h3 className="text-4xl md:text-7xl font-display tracking-tighter text-white leading-none">
              SHOP BY <span className="text-primary brand-text-glow italic">CATEGORY</span>
            </h3>
          </div>
          <Link to="/categories">
            <Button variant="ghost" className="text-white/40 hover:text-primary transition-all uppercase tracking-[0.4em] text-[10px] font-bold p-0 h-auto group">
              View All <ChevronRight size={16} className="ml-4 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayCategories.length > 0 ? displayCategories.map((category) => {
            const categoryImage = category.image_url || products.find(p => (p.category || "").trim().toLowerCase() === category.name.trim().toLowerCase())?.image_url || "https://picsum.photos/seed/category/800/1000";
            return (
              <Link 
                key={category.id} 
                to={`/products?category=${category.name}`}
                className="group relative aspect-[16/10] overflow-hidden rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all duration-500"
              >
                <img 
                  src={getDirectImageUrl(categoryImage)} 
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl md:text-3xl font-display font-bold tracking-tighter text-white group-hover:text-primary transition-colors italic uppercase">
                    {category.name}
                  </h3>
                </div>
              </Link>
            );
          }) : (
            [1,2,3].map(i => (
              <div key={i} className="aspect-[16/10] bg-white/5 rounded-3xl animate-pulse" />
            ))
          )}
        </div>
      </section>

      {/* Featured Section */}
      <section className="px-6 py-24 md:py-40 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-8">
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.5em] uppercase text-primary font-bold block">Curated Selection</span>
            <h3 className="text-4xl md:text-7xl font-display tracking-tighter text-white leading-none">
              NEW <span className="text-primary brand-text-glow">ARRIVALS</span>
            </h3>
          </div>
          <Link to="/products">
            <Button variant="ghost" className="text-white/40 hover:text-primary transition-all uppercase tracking-[0.4em] text-[10px] font-bold p-0 h-auto group">
              Explore All <ChevronRight size={16} className="ml-4 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="py-40 text-center border border-white/5 bg-white/5">
            <p className="text-primary/30 uppercase tracking-[0.5em] text-[10px] font-bold italic">No products available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-20">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

const ProductDetailPage = ({ products, onAddToCart }: { products: Product[]; onAddToCart: (p: Product, q?: number, s?: string, c?: string) => void }) => {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const [activeImage, setActiveImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (product) {
      setActiveImage((product.images && product.images.length > 0) ? product.images[0] : (product.image_url || undefined));
    }
  }, [product]);

  if (!product) return <div className="min-h-screen flex items-center justify-center text-primary">Product not found</div>;

  const allImages = (product.images && product.images.length > 0) ? product.images : (product.image_url ? [product.image_url] : []);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || "");
  const [quantity, setQuantity] = useState(1);

  return (
    <section className="px-6 py-32 md:py-48 max-w-7xl mx-auto min-h-screen">
      <div className="grid lg:grid-cols-2 gap-12 md:gap-24">
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bento-card aspect-[4/5] relative group"
          >
            <img 
              src={getDirectImageUrl(activeImage)} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
            />
          </motion.div>
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-4">
              {allImages.map((img, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "aspect-square cursor-pointer border transition-all overflow-hidden",
                    activeImage === img ? "border-primary brand-glow" : "border-white/5 grayscale hover:grayscale-0"
                  )}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={getDirectImageUrl(img)} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center space-y-10 md:space-y-16">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <Badge className="bg-primary/10 text-primary rounded-full border border-primary/20 px-4 py-1 uppercase tracking-widest text-[10px] font-bold">{product.category}</Badge>
              <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Ref. #{product.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <h1 className="text-4xl md:text-8xl font-heading font-black tracking-tighter text-white leading-none uppercase">
              {product.name}
            </h1>
            <div className="flex items-center gap-6">
              <span className="text-3xl md:text-6xl font-heading font-black text-white">Rs. {product.price.toLocaleString()}</span>
              {product.original_price > product.price && (
                <span className="text-xl md:text-3xl text-white/20 line-through font-heading font-black">Rs. {product.original_price.toLocaleString()}</span>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.4em] text-primary font-black">Description</p>
            <p className="text-white/60 leading-relaxed text-base max-w-md font-medium">{product.description || "High-quality premium essential engineered for the modern individual."}</p>
          </div>

          <div className="space-y-12">
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-6">
                <p className="text-[11px] uppercase tracking-[0.4em] text-white/40 font-black">Select Size</p>
                <div className="flex flex-wrap gap-4">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={cn(
                        "px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] border transition-all rounded-full",
                        selectedSize === size ? "primary-gradient border-primary text-white brand-glow shadow-lg scale-105" : "border-white/10 text-white/50 hover:border-white/30"
                      )}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="space-y-6">
                <p className="text-[11px] uppercase tracking-[0.4em] text-white/40 font-black">Select Color</p>
                <div className="flex flex-wrap gap-4">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      className={cn(
                        "px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] border transition-all rounded-full",
                        selectedColor === color ? "primary-gradient border-primary text-white brand-glow shadow-lg scale-105" : "border-white/10 text-white/50 hover:border-white/30"
                      )}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-8 pt-12 border-t border-white/5">
              <div className="flex items-center border border-white/10 rounded-full overflow-hidden bg-white/[0.02]">
                <Button variant="ghost" size="icon" className="h-16 w-16 text-white hover:bg-white/5" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={18} /></Button>
                <span className="w-16 text-center text-xl font-black text-white">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-16 w-16 text-white hover:bg-white/5" onClick={() => setQuantity(quantity + 1)}><Plus size={18} /></Button>
              </div>
              <Button 
                className="flex-1 primary-gradient text-white hover:scale-[1.05] active:scale-95 rounded-full h-16 font-black uppercase tracking-[0.4em] text-[13px] brand-glow transition-all duration-500 shadow-2xl"
                onClick={() => onAddToCart(product, quantity, selectedSize, selectedColor)}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AccountModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onLogin, 
  onLogout 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  user: any; 
  onLogin: (e: string, p: string, isSignUp: boolean, phone?: string) => Promise<void>; 
  onLogout: () => void;
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  const isAdmin = user?.email === "admin@vertexlab@gmail.com";

  useEffect(() => {
    if (user && !isAdmin) {
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => setProfile(data));
    }
  }, [user, isAdmin]);

  const handleSubmit = async () => {
    if (!email || !password || (isSignUp && !phoneNumber)) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onLogin(email, password, isSignUp, phoneNumber);
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-white/5 max-w-md p-0 overflow-hidden rounded-3xl">
        <div className="p-8 md:p-12 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-4xl font-display tracking-tighter text-white">
              {user ? "ACCOUNT" : (isSignUp ? "JOIN" : "LOGIN")}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white/40 hover:text-white">
              <X size={20} />
            </Button>
          </div>
          
          {user ? (
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Logged in as</p>
                <p className="text-xl font-display text-white">{user.email}</p>
                {profile?.phone && (
                  <p className="text-sm text-primary font-mono mt-2">PH: {profile.phone}</p>
                )}
              </div>

              <div className="grid gap-3">
                {isAdmin && (
                  <Button 
                    className="w-full bg-primary text-white rounded-full py-6 text-[10px] font-bold uppercase tracking-widest brand-glow"
                    onClick={() => {
                      navigate("/admin");
                      onClose();
                    }}
                  >
                    Admin Dashboard
                  </Button>
                )}

                <Button 
                  variant="ghost" 
                  className="w-full text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-full py-6 text-[10px] font-bold uppercase tracking-widest"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <p className="text-red-500 text-[10px] uppercase tracking-widest font-bold text-center">{error}</p>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
                    placeholder="name@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
                {isSignUp && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                )}
              </div>
              <Button 
                className="w-full bg-primary text-white rounded-full py-8 text-[10px] font-bold uppercase tracking-widest brand-glow disabled:opacity-50"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
              </Button>
              <button 
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="w-full text-[10px] text-white/30 hover:text-primary uppercase tracking-widest transition-colors font-bold"
                disabled={loading}
              >
                {isSignUp ? "Already have an account? Sign in" : "New here? Create account"}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Main App ---

const AdminPanel = ({ user, showToast, globalProducts, globalCategories }: { user: any; showToast: (m: string, t?: 'success' | 'error') => void; globalProducts: Product[]; globalCategories: Category[] }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'users'>('products');
  const [products, setProducts] = useState<Product[]>(globalProducts);
  const [categories, setCategories] = useState<Category[]>(globalCategories);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(globalProducts.length === 0);
  const navigate = useNavigate();

  // Update local state when global state changes
  useEffect(() => {
    if (globalProducts.length > 0) setProducts(globalProducts);
    if (globalCategories.length > 0) setCategories(globalCategories);
  }, [globalProducts, globalCategories]);

  // Security check
  useEffect(() => {
    if (!user || user.email !== "admin@vertexlab@gmail.com") {
      navigate("/");
    }
  }, [user, navigate]);

  const fetchData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    
    const [pRes, cRes, oRes, uRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false })
    ]);
    
    if (pRes.error) console.error("Products Fetch Error:", pRes.error);
    if (cRes.error) console.error("Categories Fetch Error:", cRes.error);
    if (oRes.error) console.error("Orders Fetch Error:", oRes.error);
    if (uRes.error) console.error("Users Fetch Error:", uRes.error);

    if (pRes.data) setProducts(pRes.data);
    if (cRes.data) setCategories(cRes.data);
    if (oRes.data) setOrders(oRes.data);
    if (uRes.data) setUsers(uRes.data);
    
    if (isInitial) setLoading(false);
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary font-display text-2xl animate-pulse">Initializing...</div>;

  return (
    <div className="min-h-screen bg-black pt-32 pb-40 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.5em] uppercase text-primary font-bold block">Management Console</span>
            <h1 className="text-4xl md:text-8xl font-display tracking-tighter text-white leading-none">
              ADMIN <span className="text-primary brand-text-glow">PANEL</span>
            </h1>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => fetchData(true)} 
              className="text-white/20 hover:text-primary uppercase tracking-widest text-[8px] font-bold flex items-center gap-2"
            >
              <Zap size={12} className={loading ? "animate-spin" : ""} /> Refresh Data
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={async () => {
                const testOrder = {
                  customer_email: "test@example.com",
                  total: 100,
                  status: 'pending',
                  items: [{ name: "Test Product", price: 100, quantity: 1 }]
                };
                const { error } = await supabase.from('orders').insert([testOrder]);
                if (error) showToast("Test Order Failed: " + error.message, 'error');
                else {
                  showToast("Test Order Created");
                  fetchData();
                }
              }} 
              className="text-white/20 hover:text-green-500 uppercase tracking-widest text-[8px] font-bold flex items-center gap-2"
            >
              <Plus size={12} /> Create Test Order
            </Button>
          </div>
          <div className="flex gap-2 p-2 glass rounded-full overflow-x-auto">
            <Button 
              variant="ghost"
              className={cn("rounded-full uppercase tracking-widest text-[10px] font-bold py-6 px-8 transition-all whitespace-nowrap", activeTab === 'products' ? "bg-primary text-white brand-glow" : "text-white/40 hover:text-white hover:bg-white/5")}
              onClick={() => setActiveTab('products')}
            >
              <Package className="mr-3" size={16} /> Products
            </Button>
            <Button 
              variant="ghost"
              className={cn("rounded-full uppercase tracking-widest text-[10px] font-bold py-6 px-8 transition-all whitespace-nowrap", activeTab === 'categories' ? "bg-primary text-white brand-glow" : "text-white/40 hover:text-white hover:bg-white/5")}
              onClick={() => setActiveTab('categories')}
            >
              <List className="mr-3" size={16} /> Categories
            </Button>
            <Button 
              variant="ghost"
              className={cn("rounded-full uppercase tracking-widest text-[10px] font-bold py-6 px-8 transition-all whitespace-nowrap", activeTab === 'orders' ? "bg-primary text-white brand-glow" : "text-white/40 hover:text-white hover:bg-white/5")}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingCart className="mr-3" size={16} /> Orders
            </Button>
            <Button 
              variant="ghost"
              className={cn("rounded-full uppercase tracking-widest text-[10px] font-bold py-6 px-8 transition-all whitespace-nowrap", activeTab === 'users' ? "bg-primary text-white brand-glow" : "text-white/40 hover:text-white hover:bg-white/5")}
              onClick={() => setActiveTab('users')}
            >
              <Users className="mr-3" size={16} /> Users
            </Button>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'products' && <AdminProducts products={products} categories={categories} onRefresh={fetchData} showToast={showToast} />}
            {activeTab === 'categories' && <AdminCategories categories={categories} onRefresh={fetchData} showToast={showToast} />}
            {activeTab === 'orders' && <AdminOrders orders={orders} onRefresh={fetchData} showToast={showToast} />}
            {activeTab === 'users' && <AdminUsers users={users} onRefresh={fetchData} showToast={showToast} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Admin Components ---

const VariationInput = ({ 
  label, 
  values, 
  onChange 
}: { 
  label: string; 
  values: string[]; 
  onChange: (newValues: string[]) => void 
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onChange([...values, inputValue.trim()]);
      setInputValue("");
    }
  };

  return (
    <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
      <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{label}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((v, i) => (
          <div key={i} className="flex items-center bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full gap-2 text-[10px] font-bold">
            <span>{v}</span>
            <button onClick={(e) => { e.preventDefault(); onChange(values.filter((_, idx) => idx !== i)); }} className="hover:text-white transition-colors">
              <X size={10} />
            </button>
          </div>
        ))}
        {values.length === 0 && <span className="text-[10px] text-white/20 uppercase font-bold">No {label.toLowerCase()} added</span>}
      </div>
      <div className="flex gap-2">
        <input 
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[10px] text-white focus:outline-none focus:border-primary transition-all" 
          placeholder={`Add ${label.toLowerCase()}...`}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button 
          type="button"
          onClick={handleAdd}
          className="bg-white/10 text-white hover:bg-white/20 rounded-full px-4 h-auto text-[10px] font-bold uppercase tracking-widest"
        >
          Add
        </Button>
      </div>
    </div>
  );
};

const AdminCategories = ({ categories, onRefresh, showToast }: { categories: Category[], onRefresh: () => void, showToast: (m: string, t?: 'success' | 'error') => void }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({});
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      showToast("Icon uploaded successfully");
    } catch (error: any) {
      showToast("Error uploading icon: " + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (id?: string) => {
    try {
      setUploading(true);
      const dataToSave: any = { ...formData };
      delete dataToSave.id;

      let result;
      if (id && id !== 'new') {
        result = await supabase.from('categories').update(dataToSave).eq('id', id);
      } else {
        result = await supabase.from('categories').insert([dataToSave]);
      }

      if (result.error) throw result.error;

      setEditingId(null);
      setFormData({});
      await onRefresh();
      showToast("Category Saved Successfully");
    } catch (error: any) {
      showToast("Error: " + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) showToast("Error deleting category: " + error.message, 'error');
    else showToast("Category Deleted");
    onRefresh();
  };

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-xl md:text-2xl font-display tracking-tighter text-white italic">CATEGORY TAXONOMY</h3>
          <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Manage your store categories and hierarchies.</p>
        </div>
        <Button 
          className="w-full md:w-auto bg-primary text-white rounded-none py-6 md:py-8 px-10 md:px-12 uppercase tracking-[0.3em] text-[10px] font-bold brand-glow group relative overflow-hidden"
          onClick={() => {
            setEditingId('new');
            setFormData({ name: '', image_url: '' });
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-3"><Plus size={16} /> New Category</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {editingId === 'new' && (
          <div className="glass p-6 space-y-4 border-primary/50 animate-in fade-in zoom-in-95">
            <input 
              className="w-full bg-black border border-white/10 p-4 text-[10px] text-white focus:border-primary transition-all font-mono" 
              placeholder="CATEGORY NAME" 
              value={formData.name || ''} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
            <div className="space-y-2">
              <input 
                className="w-full bg-black border border-white/10 p-4 text-[10px] text-white focus:border-primary transition-all font-mono" 
                placeholder="IMAGE URL" 
                value={formData.image_url || ''} 
                onChange={e => setFormData({...formData, image_url: e.target.value})} 
              />
              <div className="relative">
                <input type="file" accept="image/*" className="hidden" id="cat-upload-new" onChange={handleFileUpload} disabled={uploading} />
                <label htmlFor="cat-upload-new" className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-3 text-[8px] uppercase tracking-widest font-bold cursor-pointer hover:bg-primary/10 hover:border-primary transition-all">
                  <Upload size={14} /> {uploading ? "UPLOADING..." : "UPLOAD FROM DEVICE"}
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-green-500 text-white" onClick={() => handleSave()}>Save</Button>
              <Button variant="ghost" className="flex-1 text-white" onClick={() => setEditingId(null)}>Cancel</Button>
            </div>
          </div>
        )}
        {categories.map(c => (
          <div key={c.id} className="glass p-6 space-y-4 group relative overflow-hidden">
            {editingId === c.id ? (
              <div className="space-y-4">
                <input 
                  className="w-full bg-black border border-white/10 p-4 text-[10px] text-white focus:border-primary transition-all font-mono" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
                <div className="space-y-2">
                  <input 
                    className="w-full bg-black border border-white/10 p-4 text-[10px] text-white focus:border-primary transition-all font-mono" 
                    value={formData.image_url || ''} 
                    onChange={e => setFormData({...formData, image_url: e.target.value})} 
                  />
                  <div className="relative">
                    <input type="file" accept="image/*" className="hidden" id={`cat-upload-${c.id}`} onChange={handleFileUpload} disabled={uploading} />
                    <label htmlFor={`cat-upload-${c.id}`} className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-3 text-[8px] uppercase tracking-widest font-bold cursor-pointer hover:bg-primary/10 hover:border-primary transition-all">
                      <Upload size={14} /> {uploading ? "UPLOADING..." : "CHANGE ICON"}
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-green-500 text-white" onClick={() => handleSave(c.id)}>Save</Button>
                  <Button variant="ghost" className="flex-1 text-white" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="aspect-video relative overflow-hidden rounded-xl bg-white/5">
                  <img src={getDirectImageUrl(c.image_url || "")} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                  <h4 className="absolute bottom-4 left-4 text-xl font-display italic text-white uppercase tracking-tighter">{c.name}</h4>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" className="text-white/40 hover:text-primary" onClick={() => { setEditingId(c.id); setFormData(c); }}><Edit size={14} /></Button>
                  <Button variant="ghost" size="icon" className="text-white/40 hover:text-red-500" onClick={() => handleDelete(c.id)}><Trash size={14} /></Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminProducts = ({ products, categories, onRefresh, showToast }: { products: Product[], categories: Category[], onRefresh: () => void, showToast: (m: string, t?: 'success' | 'error') => void }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newImages = [...(formData.images || [])];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        newImages.push(publicUrl);
      }

      setFormData({ 
        ...formData, 
        images: newImages,
        image_url: newImages[0] || formData.image_url 
      });
    } catch (error: any) {
      showToast("Error uploading image: " + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (id?: string) => {
    try {
      setUploading(true);
      const dataToSave: any = { ...formData };
      delete dataToSave.id;
      if (!dataToSave.images || dataToSave.images.length === 0) {
        delete dataToSave.images;
      }

      let result;
      if (id && id !== 'new') {
        result = await supabase.from('products').update(dataToSave).eq('id', id);
      } else {
        result = await supabase.from('products').insert([dataToSave]);
      }

      if (result.error) throw result.error;

      setEditingId(null);
      setFormData({});
      await onRefresh();
      showToast("Product Saved Successfully");
    } catch (error: any) {
      showToast("Error: " + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) showToast("Error deleting product: " + error.message, 'error');
    else showToast("Product Deleted");
    onRefresh();
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages, image_url: newImages[0] || "" });
  };

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-xl md:text-2xl font-display tracking-tighter text-white italic">PRODUCT COLLECTION</h3>
          <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Manage your store products and inventory.</p>
        </div>
        <Button 
          className="w-full md:w-auto bg-primary text-white rounded-none py-6 md:py-8 px-10 md:px-12 uppercase tracking-[0.3em] text-[10px] font-bold brand-glow group relative overflow-hidden"
          onClick={() => {
            setEditingId('new');
            setFormData({ name: '', price: 0, original_price: 0, image_url: '', images: [], description: '', sizes: [], colors: [] });
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-3"><Plus size={16} /> New Product</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </Button>
      </div>

      <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10 text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-primary font-bold">
              <th className="py-4 md:py-6 px-2 md:px-4">Visual</th>
              <th className="py-4 md:py-6 px-2 md:px-4">Designation</th>
              <th className="py-4 md:py-6 px-2 md:px-4">Value</th>
              <th className="py-4 md:py-6 px-2 md:px-4 text-right">Control</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {editingId === 'new' && (
              <tr className="border-b border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-4 duration-500">
                <td className="py-6 md:py-8 px-2 md:px-4">
                  <div className="flex flex-col gap-4 min-w-[150px] md:min-w-[200px]">
                    <div className="flex flex-wrap gap-2">
                      {(formData.images || []).map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={getDirectImageUrl(img)} className="w-12 h-12 md:w-16 md:h-16 object-cover border border-primary brand-glow" />
                          <button onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-primary text-white rounded-none p-1 shadow-xl"><X size={10} /></button>
                        </div>
                      ))}
                    </div>
                    <div className="relative">
                      <input type="file" accept="image/*" multiple className="hidden" id="file-upload-new" onChange={handleFileUpload} disabled={uploading} />
                      <label htmlFor="file-upload-new" className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-3 md:py-4 text-[8px] md:text-[10px] uppercase tracking-widest font-bold cursor-pointer hover:bg-primary/10 hover:border-primary transition-all">
                        <Upload size={14} /> {uploading ? "UPLOADING..." : "ADD VISUALS"}
                      </label>
                    </div>
                  </div>
                </td>
                <td className="py-6 md:py-8 px-2 md:px-4">
                  <div className="space-y-4 min-w-[200px] md:min-w-[300px]">
                    <input className="w-full bg-black border border-white/10 p-3 md:p-4 text-[10px] md:text-xs text-white focus:border-primary transition-all font-mono" placeholder="PRODUCT NAME" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <select 
                      className="w-full bg-black border border-white/10 p-3 md:p-4 text-[10px] md:text-xs text-white focus:border-primary transition-all font-mono uppercase"
                      value={formData.category || ''}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <VariationInput label="Sizes" values={formData.sizes || []} onChange={vals => setFormData({...formData, sizes: vals})} />
                      <VariationInput label="Colors" values={formData.colors || []} onChange={vals => setFormData({...formData, colors: vals})} />
                    </div>
                  </div>
                </td>
                <td className="py-6 md:py-8 px-2 md:px-4">
                  <div className="space-y-4 min-w-[100px] md:min-w-[150px]">
                    <div className="space-y-2">
                      <p className="text-[8px] uppercase tracking-widest text-primary font-bold">Sale Value</p>
                      <input type="number" className="w-full bg-black border border-white/10 p-3 md:p-4 text-[10px] md:text-xs text-white font-mono" placeholder="0" value={formData.price ?? 0} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[8px] uppercase tracking-widest text-white/30 font-bold">Original Value</p>
                      <input type="number" className="w-full bg-black border border-white/10 p-3 md:p-4 text-[8px] md:text-[10px] text-white/50 font-mono" placeholder="0" value={formData.original_price ?? 0} onChange={e => setFormData({...formData, original_price: Number(e.target.value)})} />
                    </div>
                  </div>
                </td>
                <td className="py-6 md:py-8 px-2 md:px-4 text-right">
                  <div className="flex justify-end gap-2 md:gap-3">
                    <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 text-green-500 hover:bg-green-500/10 rounded-none" onClick={() => handleSave()}><Save size={18} md:size={20} /></Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 text-primary hover:bg-primary/10 rounded-none" onClick={() => setEditingId(null)}><X size={18} md:size={20} /></Button>
                  </div>
                </td>
              </tr>
            )}
            {products.map(p => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                <td className="py-6 md:py-8 px-2 md:px-4">
                  <div className="flex flex-wrap gap-2 max-w-[100px] md:max-w-[150px]">
                    {(editingId === p.id ? (formData.images || []) : (p.images || (p.image_url ? [p.image_url] : []))).slice(0, 3).map((img, idx) => (
                      <img key={idx} src={getDirectImageUrl(img)} className="w-10 h-10 md:w-12 md:h-12 object-cover border border-white/10 group-hover:border-primary transition-colors" />
                    ))}
                  </div>
                </td>
                <td className="py-6 md:py-8 px-2 md:px-4">
                  {editingId === p.id ? (
                    <div className="space-y-4 min-w-[200px] md:min-w-[300px]">
                      <input className="w-full bg-black border border-white/10 p-3 md:p-4 text-[10px] md:text-xs text-white font-mono" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                      <select 
                        className="w-full bg-black border border-white/10 p-3 md:p-4 text-[10px] md:text-xs text-white focus:border-primary transition-all font-mono uppercase"
                        value={formData.category || ''}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <VariationInput label="Sizes" values={formData.sizes || []} onChange={vals => setFormData({...formData, sizes: vals})} />
                        <VariationInput label="Colors" values={formData.colors || []} onChange={vals => setFormData({...formData, colors: vals})} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-bold text-white tracking-widest uppercase text-xs md:text-sm group-hover:text-primary transition-colors">{p.name}</p>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{p.category}</p>
                      <p className="text-[8px] md:text-[10px] text-white/30 font-mono">ID: {p.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  )}
                </td>
                <td className="py-6 md:py-8 px-2 md:px-4">
                  {editingId === p.id ? (
                    <div className="space-y-4 min-w-[100px] md:min-w-[150px]">
                      <input type="number" className="w-full bg-black border border-white/10 p-3 md:p-4 text-[10px] md:text-xs text-white font-mono" value={formData.price ?? 0} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                      <input type="number" className="w-full bg-black border border-white/10 p-3 md:p-4 text-[8px] md:text-[10px] text-white/50 font-mono" value={formData.original_price ?? 0} onChange={e => setFormData({...formData, original_price: Number(e.target.value)})} />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-bold text-white text-base md:text-lg italic tracking-tighter">Rs. {p.price.toLocaleString()}</p>
                      {p.original_price > p.price && <p className="text-[8px] md:text-[10px] line-through text-white/20">Rs. {p.original_price.toLocaleString()}</p>}
                    </div>
                  )}
                </td>
                <td className="py-6 md:py-8 px-2 md:px-4 text-right">
                  <div className="flex justify-end gap-2 md:gap-3">
                    {editingId === p.id ? (
                      <>
                        <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 text-green-500 hover:bg-green-500/10 rounded-none" onClick={() => handleSave(p.id)}><Save size={18} md:size={20} /></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 text-primary hover:bg-primary/10 rounded-none" onClick={() => setEditingId(null)}><X size={18} md:size={20} /></Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 text-white/40 hover:text-primary hover:bg-primary/10 rounded-none" onClick={() => { setEditingId(p.id); setFormData(p); }}><Edit size={16} md:size={18} /></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-none" onClick={() => handleDelete(p.id)}><Trash size={16} md:size={18} /></Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminUsers = ({ users, onRefresh, showToast }: { users: any[], onRefresh: () => void, showToast: (m: string, t?: 'success' | 'error') => void }) => {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h3 className="text-xl md:text-2xl font-display tracking-tighter text-white italic">USER DIRECTORY</h3>
        <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Manage registered customers and their profiles.</p>
      </div>

      <div className="grid gap-4">
        {users.map(u => (
          <div key={u.id} className="glass p-6 border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-all">
            <div className="space-y-1">
              <p className="text-white font-display text-xl tracking-tight">{u.email}</p>
              <p className="text-primary font-mono text-[10px] uppercase tracking-widest font-bold">ID: {u.id.slice(0, 8)}</p>
            </div>
            <div className="flex flex-col md:items-end gap-1">
              <p className="text-white font-bold text-sm">{u.phone || 'NO PHONE'}</p>
              <p className="text-white/20 text-[8px] uppercase tracking-widest font-bold">Registered {new Date(u.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
            <p className="text-white/20 uppercase tracking-[0.3em] text-[10px] font-bold">No users found in directory</p>
          </div>
        )}
      </div>
    </div>
  );
};
const AdminOrders = ({ orders, onRefresh, showToast }: { orders: Order[], onRefresh: () => void, showToast: (m: string, t?: 'success' | 'error') => void }) => {
  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    onRefresh();
  };

  const deleteOrder = async (id: string) => {
    await supabase.from('orders').delete().eq('id', id);
    onRefresh();
  };

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="space-y-1">
        <h3 className="text-xl md:text-2xl font-display tracking-tighter text-white italic">ORDER MANAGEMENT</h3>
        <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Monitor and manage customer orders.</p>
      </div>

      <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-white/10 text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-primary font-bold">
              <th className="py-4 md:py-6 px-2 md:px-4">Designation</th>
              <th className="py-4 md:py-6 px-2 md:px-4">Soul</th>
              <th className="py-4 md:py-6 px-2 md:px-4">Manifest</th>
              <th className="py-4 md:py-6 px-2 md:px-4">Status</th>
              <th className="py-4 md:py-6 px-2 md:px-4 text-right">Control</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {orders.length === 0 ? (
              <tr><td colSpan={5} className="py-24 md:py-40 text-center text-white/20 uppercase tracking-[0.5em] text-[8px] md:text-[10px] font-bold">No manifests recorded</td></tr>
            ) : orders.map(o => (
              <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                <td className="py-6 md:py-8 px-2 md:px-4">
                  <div className="text-primary font-bold text-[8px] md:text-[10px] uppercase tracking-widest">#{o.id.slice(0, 8).toUpperCase()}</div>
                  <div className="text-[7px] md:text-[8px] text-white/30 font-mono mt-1">{new Date(o.created_at).toLocaleDateString()}</div>
                </td>
                <td className="py-6 md:py-8 px-2 md:px-4">
                  <div className="text-white font-bold text-[10px] md:text-xs tracking-tighter truncate max-w-[120px] md:max-w-none">{o.customer_email || 'ANONYMOUS'}</div>
                  {o.phone && (
                    <div className="text-primary font-mono text-[8px] md:text-[9px] uppercase tracking-widest font-bold mt-1">{o.phone}</div>
                  )}
                </td>
                <td className="py-6 md:py-8 px-2 md:px-4">
                  <div className="font-bold text-white text-base md:text-lg italic tracking-tighter">Rs. {o.total.toLocaleString()}</div>
                  <div className="space-y-1 md:space-y-2 mt-3 md:mt-4">
                    {o.items?.map((item: any, i: number) => (
                      <div key={i} className="text-[8px] md:text-[9px] text-white/40 uppercase tracking-widest flex items-center gap-2 md:gap-3">
                        <span className="bg-primary/20 text-primary px-1.5 md:px-2 py-0.5 font-bold">0{item.quantity}</span>
                        <span className="truncate max-w-[100px] md:max-w-none">{item.name}</span>
                        {(item.size !== 'N/A' || item.color !== 'N/A') && (
                          <span className="text-[7px] md:text-[8px] opacity-30">
                            [{[item.size, item.color].filter(v => v && v !== 'N/A').join(' • ')}]
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="py-6 md:py-8 px-2 md:px-4">
                  <Badge className={cn(
                    "border-none rounded-none uppercase text-[8px] md:text-[10px] px-3 md:px-4 py-1 font-bold tracking-widest",
                    o.status === 'completed' ? "bg-green-500 text-white" : 
                    o.status === 'pending' ? "bg-yellow-500 text-black" : 
                    "bg-primary text-white brand-glow"
                  )}>
                    {o.status}
                  </Badge>
                </td>
                <td className="py-6 md:py-8 px-2 md:px-4 text-right">
                  <div className="flex items-center justify-end gap-2 md:gap-4">
                    <select 
                      className="bg-black border border-white/10 text-[8px] md:text-[10px] uppercase tracking-widest p-2 md:p-3 text-primary focus:outline-none focus:border-primary transition-all font-bold"
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                    >
                      <option value="pending">PENDING</option>
                      <option value="processing">PROCESSING</option>
                      <option value="shipped">SHIPPED</option>
                      <option value="completed">COMPLETED</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>
                    <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-none" onClick={() => deleteOrder(o.id)}>
                      <Trash size={16} md:size={18} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('vertex_store_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [globalProducts, setGlobalProducts] = useState<Product[]>([]);
  const [globalCategories, setGlobalCategories] = useState<Category[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchGlobalData = async () => {
    const [pRes, cRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name')
    ]);
    
    if (pRes.data) setGlobalProducts(pRes.data);
    if (cRes.data) setGlobalCategories(cRes.data);
    setProductsLoading(false);
  };

  useEffect(() => {
    // Check for Admin Bypass session first
    const savedBypass = localStorage.getItem('admin_bypass_session');
    if (savedBypass) {
      setUser(JSON.parse(savedBypass));
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only update if we're not in a bypass session
      if (!localStorage.getItem('admin_bypass_session')) {
        setUser(session?.user ?? null);
      }
    });

    fetchGlobalData();

    const pChannel = supabase
      .channel('global_products_realtime')
      .on('postgres_changes', { event: '*', table: 'products', schema: 'public' }, () => {
        fetchGlobalData();
      })
      .subscribe();

    const cChannel = supabase
      .channel('global_categories_realtime')
      .on('postgres_changes', { event: '*', table: 'categories', schema: 'public' }, () => {
        fetchGlobalData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(pChannel);
      supabase.removeChannel(cChannel);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('vertex_store_cart', JSON.stringify(cart));
  }, [cart]);

  const handleLogin = async (email: string, pass: string, isSignUp: boolean, phone?: string) => {
    // --- ADMIN BYPASS ---
    // This allows you to log in even if Supabase is rate-limiting you
    if (email === "admin@vertexlab@gmail.com" && pass === "Vertexlab0123") {
      const adminUser = { email: "admin@vertexlab@gmail.com", id: "admin-bypass" };
      setUser(adminUser);
      localStorage.setItem('admin_bypass_session', JSON.stringify(adminUser));
      setIsAccountOpen(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password: pass });
        if (error) throw error;
        
        if (data.user && phone) {
          await supabase.from('profiles').insert([
            { id: data.user.id, email, phone }
          ]);
        }
        
        showToast("Check your email for confirmation!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        setIsAccountOpen(false);
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('admin_bypass_session');
    await supabase.auth.signOut();
    setIsAccountOpen(false);
  };

  const addToCart = (product: Product, quantity: number = 1, size?: string, color?: string) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.product.id === product.id && 
        item.selectedSize === size && 
        item.selectedColor === color
      );
      if (existing) {
        return prev.map(item => 
          (item.product.id === product.id && item.selectedSize === size && item.selectedColor === color)
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { product, quantity, selectedSize: size, selectedColor: color }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number, size?: string, color?: string) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && item.selectedSize === size && item.selectedColor === color) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setCart(prev => prev.filter(item => 
      !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      setIsAccountOpen(true);
      return;
    }

    if (cart.length === 0) {
      showToast("Your bag is empty", 'error');
      return;
    }

    try {
      let phone = '';
      if (user.id !== 'admin-bypass') {
        const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
        if (profile) phone = profile.phone;
      }

      const orderData = {
        user_id: user.id,
        customer_email: user.email || 'Guest/Unknown',
        phone: phone,
        total: cartTotal,
        status: 'pending',
        items: cart.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          size: item.selectedSize || 'N/A',
          color: item.selectedColor || 'N/A'
        }))
      };

      const { error } = await supabase.from('orders').insert([orderData]);

      if (error) {
        console.error("Checkout Error Details:", error);
        throw error;
      }

      setCheckoutSuccess(true);
      setCart([]);
    } catch (error: any) {
      showToast("Error: " + (error.message || "Could not place order"), 'error');
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
        {toast && (
          <div className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 border text-[10px] font-bold uppercase tracking-widest brand-glow animate-in fade-in slide-in-from-top-4",
            toast.type === 'success' ? "bg-black border-green-500 text-green-500" : "bg-black border-red-500 text-red-500"
          )}>
            {toast.message}
          </div>
        )}
        <Navbar 
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
          onOpenCart={() => setIsCartOpen(true)}
          user={user}
          onOpenAccount={() => setIsAccountOpen(true)}
          categories={globalCategories}
        />

        <Routes>
          <Route path="/" element={<HomePage products={globalProducts} categories={globalCategories} loading={productsLoading} onAddToCart={addToCart} />} />
          <Route path="/products" element={<AllProductsPage products={globalProducts} loading={productsLoading} onAddToCart={addToCart} />} />
          <Route path="/categories" element={<CategoriesPage categories={globalCategories} products={globalProducts} />} />
          <Route path="/product/:id" element={<ProductDetailPage products={globalProducts} onAddToCart={addToCart} />} />
          <Route path="/admin" element={<AdminPanel user={user} showToast={showToast} globalProducts={globalProducts} globalCategories={globalCategories} />} />
        </Routes>

        {/* Footer */}
        <footer className="bg-black py-32 md:py-48 px-6 mt-40 border-t border-white/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-12 relative z-10">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="relative"
            >
              <img 
                src="https://i.ibb.co/1frr1Y2p/logo.png" 
                alt="Vertex Store" 
                className="h-20 md:h-24 w-auto object-contain brand-glow"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = "https://ibb.co/1frr1Y2p"; 
                }}
              />
            </motion.div>
            <div className="space-y-4">
              <h2 className="text-4xl md:text-7xl font-display tracking-tighter text-white leading-none">
                VERTEX <span className="text-primary brand-text-glow">STORE</span>
              </h2>
              <p className="text-primary text-[10px] uppercase tracking-[1em] font-bold">Elevate Your Lifestyle</p>
            </div>
            <p className="text-white/30 text-xs md:text-sm tracking-widest max-w-lg px-4">
              Premium lifestyle essentials engineered for the modern individual. Quality, style, and innovation in every piece.
            </p>
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-white/40">
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">TikTok</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
            </div>
            <div className="pt-12 border-t border-white/5 w-full flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">© 2024 Vertex Store. All Rights Reserved.</p>
              <div className="flex gap-6 text-[10px] uppercase tracking-widest text-white/20 font-bold">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Shipping</a>
              </div>
            </div>
          </div>
        </footer>

        <AccountModal 
          isOpen={isAccountOpen} 
          onClose={() => setIsAccountOpen(false)}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        {/* WhatsApp Floating Button */}
        <motion.a
          href="https://wa.me/923283443751"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-10 right-10 z-[100] primary-gradient text-white p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(255,107,0,0.3)] brand-glow flex items-center justify-center group/wa transition-all duration-500"
        >
          <MessageCircle size={28} fill="white" className="group-hover/wa:scale-110 transition-transform" />
          <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full border-2 border-black shadow-xl animate-bounce">
            LIVE
          </div>
          <div className="absolute right-full mr-4 bg-black/80 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full opacity-0 group-hover/wa:opacity-100 transition-opacity whitespace-nowrap border border-white/10 tracking-widest uppercase">
            Chat with Vertex
          </div>
        </motion.a>

        {/* Cart Drawer */}
        <Sheet open={isCartOpen} onOpenChange={(open) => {
          setIsCartOpen(open);
          if (!open) setCheckoutSuccess(false);
        }}>
          <SheetContent className="bg-black border-l border-white/5 w-full sm:max-w-md p-0 flex flex-col rounded-none">
            <SheetHeader className="p-6 md:p-10 border-b border-white/5 flex-row items-center justify-between space-y-0">
              <SheetTitle className="text-2xl md:text-4xl font-display tracking-tighter uppercase text-white italic">YOUR <span className="text-primary">CART</span></SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="text-primary hover:bg-primary/10 rounded-none h-10 w-10 md:h-12 md:w-12">
                <X size={20} md:size={24} />
              </Button>
            </SheetHeader>
            
            {checkoutSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 brand-glow">
                  <Check size={48} className="text-primary" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-display tracking-tighter text-white italic">ORDER PLACED!</h3>
                  <p className="text-[11px] uppercase tracking-widest text-white/60 leading-relaxed max-w-xs mx-auto">
                    If you want to know about your order, like where it has reached or if it has been accepted, click the message icon and contact Vertex Lab. Thank you!
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-white/10 text-white/40 hover:text-white hover:bg-white/5 rounded-none px-10 py-6 uppercase tracking-[0.3em] text-[10px] font-bold mt-8"
                  onClick={() => {
                    setIsCartOpen(false);
                    setCheckoutSuccess(false);
                  }}
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 p-6 md:p-10">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 pt-20">
                      <div className="relative">
                        <ShoppingBag size={60} md:size={80} strokeWidth={0.5} className="text-white/10" />
                        <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
                      </div>
                      <p className="text-[8px] md:text-[10px] uppercase tracking-[0.5em] text-white/30 font-bold italic">Your cart is empty</p>
                      <Button 
                        variant="outline" 
                        className="border-white/10 text-white/40 hover:text-white hover:bg-white/5 rounded-none px-8 md:px-10 py-4 md:py-6 uppercase tracking-[0.3em] text-[8px] md:text-[10px] font-bold"
                        onClick={() => setIsCartOpen(false)}
                      >
                        Continue Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-8 md:space-y-12">
                      {cart.map((item, idx) => (
                        <motion.div 
                          key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`} 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-4 md:gap-6 group"
                        >
                          <div className="w-20 md:w-28 aspect-[4/5] bg-white/5 border border-white/5 overflow-hidden relative shrink-0">
                            <img src={getDirectImageUrl(item.product.image_url)} alt={item.product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div className="space-y-1 md:space-y-2">
                              <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white group-hover:text-primary transition-colors line-clamp-1">{item.product.name}</h4>
                              <div className="flex flex-wrap gap-2">
                                {item.selectedSize && <span className="text-[7px] md:text-[8px] uppercase tracking-[0.3em] text-white/30 font-bold">Size: {item.selectedSize}</span>}
                                {item.selectedColor && <span className="text-[7px] md:text-[8px] uppercase tracking-[0.3em] text-white/30 font-bold">Color: {item.selectedColor}</span>}
                              </div>
                              <p className="text-base md:text-lg font-bold text-white tracking-tighter italic">Rs. {item.product.price.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center border border-white/10">
                                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 rounded-none text-primary hover:bg-primary/10" onClick={() => updateQuantity(item.product.id, -1, item.selectedSize, item.selectedColor)}><Minus size={10} md:size={12} /></Button>
                                <span className="w-8 md:w-10 text-center text-[10px] md:text-xs font-bold text-white">{item.quantity}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 rounded-none text-primary hover:bg-primary/10" onClick={() => updateQuantity(item.product.id, 1, item.selectedSize, item.selectedColor)}><Plus size={10} md:size={12} /></Button>
                              </div>
                              <Button variant="ghost" size="icon" className="text-white/20 hover:text-primary hover:bg-primary/5 rounded-none h-8 w-8" onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}><Trash2 size={16} md:size={18} /></Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {cart.length > 0 && (
                  <div className="p-6 md:p-10 border-t border-white/5 space-y-6 md:space-y-8 bg-black relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] md:text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold">Total Value</span>
                      <span className="text-2xl md:text-3xl font-display font-bold text-white italic tracking-tighter">Rs. {cartTotal.toLocaleString()}</span>
                    </div>
                    <Button 
                      className="w-full bg-primary text-white hover:bg-primary/90 rounded-none py-8 md:py-10 font-bold uppercase tracking-[0.4em] text-[10px] brand-glow group relative overflow-hidden"
                      onClick={handleCheckout}
                    >
                      <span className="relative z-10">Proceed to Checkout</span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </Router>
  );
}

// --- Helper components ---
function Dialog({ children, open, onOpenChange }: { children: ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-md"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DialogContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("bg-background border border-border rounded-none shadow-2xl", className)}>
      {children}
    </div>
  );
}
