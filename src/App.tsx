import React, { useState, useEffect, ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, Search, User, ShoppingBag, X, ChevronRight, ChevronLeft, Plus, Minus, Trash2, LogOut, ArrowLeft, LayoutDashboard, Package, List, ShoppingCart, Save, Edit, Trash, Upload } from "lucide-react";
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
  total: number;
  status: string;
  items: any[];
}

// --- Utilities ---
const getDirectImageUrl = (url: string) => {
  if (!url) return "";
  
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
  onOpenAccount 
}: { 
  cartCount: number; 
  onOpenCart: () => void; 
  user: any; 
  onOpenAccount: () => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) console.error("Error fetching categories:", error);
      if (data) setCategories(data);
    };
    fetchCategories();

    // Real-time subscription for categories
    const channel = supabase
      .channel('categories_realtime')
      .on('postgres_changes', { event: '*', table: 'categories', schema: 'public' }, () => {
        fetchCategories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "hover:bg-primary/20 group"
            )}
          >
            <Menu size={24} className="text-primary group-hover:scale-110 transition-transform" />
          </SheetTrigger>
          <SheetContent side="left" className="bg-background border-r border-border w-[300px] p-0">
            <div className="flex flex-col h-full pt-12">
              <div className="px-6 mb-8">
                <X 
                  className="cursor-pointer text-primary hover:opacity-70 transition-opacity" 
                  onClick={() => setIsMenuOpen(false)} 
                />
              </div>
              <div className="flex flex-col gap-6 px-6">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-display font-bold tracking-tighter text-foreground hover:text-primary transition-colors"
                >
                  HOME
                </Link>
                <Link
                  to="/products"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-display font-bold tracking-tighter text-foreground hover:text-primary transition-colors"
                >
                  ALL PRODUCTS
                </Link>
                <Link
                  to="/new-arrivals"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-display font-bold tracking-tighter text-foreground hover:text-primary transition-colors"
                >
                  NEW ARRIVALS
                </Link>
                {user?.email === "arshman15icloud@gmail.com" && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-2xl font-display font-bold tracking-tighter text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
                  >
                    <LayoutDashboard size={24} /> ADMIN PANEL
                  </Link>
                )}
                <div className="pt-4 border-t border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Categories</p>
                  <div className="flex flex-col gap-4">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.name.toLowerCase()}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="text-xl font-display font-bold tracking-tighter text-foreground hover:text-primary transition-colors uppercase"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Button variant="ghost" size="icon" className="hover:bg-primary/20">
          <Search size={24} className="text-primary" />
        </Button>
      </div>

      <Link to="/" className="absolute left-1/2 -translate-x-1/2">
        <h1 className="text-2xl font-display italic tracking-tighter lowercase text-primary devil-text-glow">
          vertex<span className="font-light text-white">lab</span>
        </h1>
      </Link>

      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-primary/20"
          onClick={onOpenAccount}
        >
          <User size={24} className="text-primary" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-primary/20 relative"
          onClick={onOpenCart}
        >
          <ShoppingBag size={24} className="text-primary" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </div>
    </nav>
  );
};

const AllProductsPage = ({ onAddToCart }: { onAddToCart: (p: Product, q?: number, s?: string, c?: string) => void }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) console.error("Error fetching all products:", error);
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();

    const channel = supabase
      .channel('products_all_realtime')
      .on('postgres_changes', { event: '*', table: 'products', schema: 'public' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="px-4 py-20 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <h2 className="text-5xl md:text-7xl font-display tracking-tighter text-primary devil-text-glow">ALL PRODUCTS</h2>
        <p className="text-muted-foreground text-sm uppercase tracking-widest">{products.length} Items</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-[4/5] bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </section>
  );
};

const CategoryPage = ({ onAddToCart }: { onAddToCart: (p: Product, q?: number, s?: string, c?: string) => void }) => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('category', categoryName || '');
      if (error) console.error(`Error fetching products for category ${categoryName}:`, error);
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();

    const channel = supabase
      .channel(`products_category_${categoryName}`)
      .on('postgres_changes', { event: '*', table: 'products', schema: 'public' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoryName]);

  return (
    <section className="px-4 py-20 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <h2 className="text-5xl md:text-7xl font-display tracking-tighter text-primary uppercase devil-text-glow">{categoryName}</h2>
        <p className="text-muted-foreground text-sm uppercase tracking-widest">{products.length} Items</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[4/5] bg-muted animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <p className="text-xl text-muted-foreground uppercase tracking-widest">No products found in this category</p>
          <Link to="/products">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">View All Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </section>
  );
};

const ProductCard = ({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product, q?: number, s?: string, c?: string) => void; key?: string | number }) => {
  const displayImage = product.images && product.images.length > 0 ? product.images[0] : product.image_url;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="group cursor-pointer"
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-muted mb-4 border border-border group-hover:border-primary/50 transition-colors">
          <img 
            src={getDirectImageUrl(displayImage)} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {product.badge && (
            <Badge className="absolute top-0 left-0 bg-primary text-white text-[10px] font-bold tracking-widest uppercase border-none rounded-none py-1.5 px-3 devil-glow">
              {product.badge}
            </Badge>
          )}
        </div>
      </Link>
      <div className="space-y-1">
        <h4 className="text-[10px] md:text-xs font-bold leading-tight text-primary uppercase tracking-widest group-hover:devil-text-glow transition-all">
          {product.name}
        </h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Rs. {product.price.toLocaleString()}</span>
            {product.original_price > product.price && (
              <span className="text-xs text-muted-foreground line-through">Rs. {product.original_price.toLocaleString()}</span>
            )}
          </div>
          <Button 
            size="icon" 
            variant="ghost"
            className="text-primary hover:bg-primary/20 h-8 w-8 rounded-none border border-transparent hover:border-primary/30"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
          >
            <ShoppingBag size={16} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const HomePage = ({ onAddToCart }: { onAddToCart: (p: Product, q?: number, s?: string, c?: string) => void }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*').limit(8);
      if (error) console.error("Error fetching home products:", error);
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();

    const channel = supabase
      .channel('products_home_realtime')
      .on('postgres_changes', { event: '*', table: 'products', schema: 'public' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[90vh] overflow-hidden">
        <img 
          src="https://picsum.photos/seed/vertex-devil/1920/1080?grayscale" 
          alt="Hero" 
          className="w-full h-full object-cover opacity-30 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <h2 className="text-7xl md:text-9xl font-display tracking-tighter mb-4 text-primary devil-text-glow italic">
              VERTEX : LAB
            </h2>
            <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full -z-10" />
          </motion.div>
          <p className="text-white/40 text-[10px] md:text-xs tracking-[0.5em] uppercase mb-12 font-bold">
            Engineered for the Underground
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/products">
              <Button className="bg-primary text-white hover:bg-primary/90 rounded-none px-12 py-7 text-xs font-bold tracking-[0.2em] uppercase devil-glow">
                Shop Collection
              </Button>
            </Link>
            <Link to="/new-arrivals">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-none px-12 py-7 text-xs font-bold tracking-[0.2em] uppercase">
                New Arrivals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="px-4 py-20 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-3xl md:text-5xl font-display tracking-tighter text-primary">
            LATEST <br /> RELEASES
          </h3>
          <Link to="/new-arrivals">
            <Button variant="ghost" className="text-primary text-xs font-bold tracking-widest uppercase">
              View All
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] bg-muted animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-primary/20">
            <p className="text-primary/50 uppercase tracking-widest text-xs">No products found in database</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

const NewArrivalsPage = ({ onAddToCart }: { onAddToCart: (p: Product, q?: number, s?: string, c?: string) => void }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*').eq('is_new', true);
      if (error) console.error("Error fetching new arrivals:", error);
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();

    const channel = supabase
      .channel('products_new_realtime')
      .on('postgres_changes', { event: '*', table: 'products', schema: 'public' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="px-4 py-20 max-w-7xl mx-auto min-h-screen">
      <h2 className="text-5xl md:text-7xl font-display tracking-tighter text-primary mb-12 devil-text-glow">NEW ARRIVALS</h2>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-[4/5] bg-muted animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-primary/20">
          <p className="text-primary/50 uppercase tracking-widest text-xs">No new arrivals found</p>
          <Link to="/products" className="mt-4 inline-block">
            <Button variant="link" className="text-primary uppercase tracking-widest text-[10px]">View All Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </section>
  );
};

const ProductDetailPage = ({ onAddToCart }: { onAddToCart: (p: Product, q?: number, s?: string, c?: string) => void }) => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) {
        setProduct(data);
        setActiveImage(data.images && data.images.length > 0 ? data.images[0] : data.image_url);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-primary">Product not found</div>;

  const allImages = product.images && product.images.length > 0 ? product.images : [product.image_url];
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || "");
  const [quantity, setQuantity] = useState(1);

  return (
    <section className="px-4 py-20 max-w-7xl mx-auto min-h-screen">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-muted overflow-hidden border border-border">
            <img 
              src={getDirectImageUrl(activeImage)} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {allImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "aspect-square bg-muted cursor-pointer border-2 transition-colors overflow-hidden",
                    activeImage === img ? "border-primary" : "border-transparent"
                  )}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={getDirectImageUrl(img)} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-2">
            <Badge className="bg-primary text-white rounded-none border-none devil-glow px-4 py-1 uppercase tracking-widest text-[10px] font-bold">{product.category}</Badge>
            <h1 className="text-5xl md:text-7xl font-display tracking-tighter text-primary devil-text-glow leading-none">{product.name}</h1>
            <div className="flex items-center gap-4 text-2xl font-bold">
              <span className="text-white">Rs. {product.price.toLocaleString()}</span>
              {product.original_price > product.price && (
                <span className="text-muted-foreground line-through">Rs. {product.original_price.toLocaleString()}</span>
              )}
            </div>
          </div>
          
          <p className="text-white/70 leading-relaxed max-w-md">{product.description || "High-quality streetwear engineered for the modern aesthetic."}</p>

          <div className="space-y-6">
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-primary">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "px-4 py-2 border text-xs font-bold transition-all",
                        selectedSize === size ? "bg-primary border-primary text-white" : "border-border text-white hover:border-primary"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-primary">Select Color</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "px-4 py-2 border text-xs font-bold transition-all",
                        selectedColor === color ? "bg-primary border-primary text-white" : "border-border text-white hover:border-primary"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-bold text-primary">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border">
                  <button 
                    className="p-3 hover:bg-white/5 text-white"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-white">{quantity}</span>
                  <button 
                    className="p-3 hover:bg-white/5 text-white"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Button 
            className="bg-primary text-white hover:bg-primary/90 rounded-none py-8 text-sm font-bold tracking-[0.3em] uppercase devil-glow"
            onClick={() => onAddToCart(product, quantity, selectedSize, selectedColor)}
          >
            Add to Bag
          </Button>
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
  onLogin: (e: string, p: string, isSignUp: boolean) => Promise<void>; 
  onLogout: () => void;
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isAdmin = user?.email === "arshman15icloud@gmail.com";

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onLogin(email, password, isSignUp);
    } catch (err: any) {
      if (err.message?.includes("rate limit")) {
        setError("Too many attempts. Please wait 5-10 minutes and try again.");
      } else if (err.message?.includes("Email not confirmed")) {
        setError("Please check your email and click the confirmation link first.");
      } else if (err.message?.includes("Invalid login credentials")) {
        setError("Wrong email or password. If you haven't signed up yet, click 'Need an account?' below.");
      } else {
        setError(err.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border max-w-md p-0 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display tracking-tighter text-primary">Account</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-primary hover:bg-primary/20">
              <X size={20} />
            </Button>
          </div>
          
          {user ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Logged in</p>
                </div>
              </div>

              {isAdmin && (
                <Button 
                  className="w-full bg-primary text-white hover:bg-primary/90 rounded-none py-6 font-bold gap-2 uppercase tracking-widest text-[10px]"
                  onClick={() => {
                    navigate("/admin");
                    onClose();
                  }}
                >
                  <LayoutDashboard size={18} /> Admin Panel
                </Button>
              )}

              <Button 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary/10 rounded-none py-6 font-bold gap-2"
                onClick={onLogout}
              >
                <LogOut size={20} /> Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] uppercase tracking-widest font-bold">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-muted border border-border px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-muted border border-border px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <Button 
                className="w-full bg-primary text-white hover:bg-primary/90 rounded-none py-6 font-bold uppercase tracking-widest disabled:opacity-50"
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
                className="w-full text-[10px] text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors"
                disabled={loading}
              >
                {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Main App ---

const AdminPanel = ({ user, showToast }: { user: any; showToast: (m: string, t?: 'success' | 'error') => void }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Security check
  useEffect(() => {
    if (!user || user.email !== "arshman15icloud@gmail.com") {
      navigate("/");
    }
  }, [user, navigate]);

  const fetchData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    
    const [pRes, cRes, oRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('orders').select('*').order('created_at', { ascending: false })
    ]);
    
    if (pRes.error) console.error("Products Fetch Error:", pRes.error);
    if (cRes.error) console.error("Categories Fetch Error:", cRes.error);
    if (oRes.error) console.error("Orders Fetch Error:", oRes.error);

    if (pRes.data) setProducts(pRes.data);
    if (cRes.data) setCategories(cRes.data);
    if (oRes.data) setOrders(oRes.data);
    
    if (isInitial) setLoading(false);
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary">Loading Admin...</div>;

  return (
    <div className="min-h-screen bg-background pt-20 pb-40 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <h1 className="text-5xl font-display tracking-tighter text-primary devil-text-glow uppercase">Admin Panel</h1>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={activeTab === 'products' ? 'default' : 'outline'}
              className={cn("rounded-none uppercase tracking-widest text-[10px] font-bold py-6 px-8", activeTab === 'products' ? "bg-primary text-white" : "border-primary text-primary")}
              onClick={() => setActiveTab('products')}
            >
              <Package className="mr-2" size={16} /> Products
            </Button>
            <Button 
              variant={activeTab === 'categories' ? 'default' : 'outline'}
              className={cn("rounded-none uppercase tracking-widest text-[10px] font-bold py-6 px-8", activeTab === 'categories' ? "bg-primary text-white" : "border-primary text-primary")}
              onClick={() => setActiveTab('categories')}
            >
              <List className="mr-2" size={16} /> Categories
            </Button>
            <Button 
              variant={activeTab === 'orders' ? 'default' : 'outline'}
              className={cn("rounded-none uppercase tracking-widest text-[10px] font-bold py-6 px-8", activeTab === 'orders' ? "bg-primary text-white" : "border-primary text-primary")}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingCart className="mr-2" size={16} /> Orders
            </Button>
          </div>
        </div>

        <div className="bg-muted/30 border border-border p-8">
          {activeTab === 'products' && <AdminProducts products={products} categories={categories} onRefresh={fetchData} showToast={showToast} />}
          {activeTab === 'categories' && <AdminCategories categories={categories} onRefresh={fetchData} showToast={showToast} />}
          {activeTab === 'orders' && <AdminOrders orders={orders} onRefresh={fetchData} showToast={showToast} />}
        </div>
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
      setUploading(true); // Reuse uploading state for saving feedback
      
      // Clean data for Supabase
      const dataToSave: any = { ...formData };
      
      // Remove fields that might cause issues if they don't exist in DB
      delete dataToSave.id;
      
      // Only include images array if it has content, to avoid errors on older DB schemas
      if (!dataToSave.images || dataToSave.images.length === 0) {
        delete dataToSave.images;
      }

      let result;
      if (id && id !== 'new') {
        result = await supabase.from('products').update(dataToSave).eq('id', id);
      } else {
        result = await supabase.from('products').insert([dataToSave]);
      }

      if (result.error) {
        console.error("Supabase Error:", result.error);
        throw new Error(result.error.message + (result.error.code === '42703' ? " (Missing column in database)" : ""));
      }

      setEditingId(null);
      setFormData({});
      await onRefresh();
      showToast("Product saved successfully!");
    } catch (error: any) {
      console.error("Save Error:", error);
      showToast("Error saving product: " + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this product?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) showToast("Error deleting product: " + error.message, 'error');
      else showToast("Product deleted successfully");
      onRefresh();
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData({ 
      ...formData, 
      images: newImages,
      image_url: newImages[0] || "" 
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white uppercase tracking-widest">Manage Products</h3>
        <Button 
          className="bg-primary text-white rounded-none uppercase tracking-widest text-[10px] font-bold"
          onClick={() => {
            setEditingId('new');
            setFormData({ name: '', price: 0, original_price: 0, image_url: '', images: [], category: categories[0]?.name || '', description: '', sizes: [], colors: [] });
          }}
        >
          <Plus size={16} className="mr-2" /> Add Product
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-[0.2em] text-primary">
              <th className="py-4 px-4">Images</th>
              <th className="py-4 px-4">Name</th>
              <th className="py-4 px-4">Price</th>
              <th className="py-4 px-4">Category</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {editingId === 'new' && (
              <tr className="border-b border-border bg-primary/5">
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(formData.images || []).map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={getDirectImageUrl(img)} className="w-12 h-12 object-cover border border-primary" />
                          <button 
                            onClick={() => removeImage(idx)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        className="hidden" 
                        id="file-upload-new" 
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                      <label 
                        htmlFor="file-upload-new" 
                        className="flex items-center justify-center gap-2 bg-primary/20 border border-primary/30 py-2 text-[10px] uppercase font-bold cursor-pointer hover:bg-primary/30 transition-colors"
                      >
                        <Upload size={12} /> {uploading ? "Uploading..." : "Add Images"}
                      </label>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-2">
                    <input className="w-full bg-background border border-border p-2 text-xs" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input className="w-full bg-background border border-border p-2 text-[10px]" placeholder="Sizes (S,M,L...)" value={formData.sizes?.join(',')} onChange={e => setFormData({...formData, sizes: e.target.value.split(',').map(s => s.trim()).filter(s => s)})} />
                    <input className="w-full bg-background border border-border p-2 text-[10px]" placeholder="Colors (Black,White...)" value={formData.colors?.join(',')} onChange={e => setFormData({...formData, colors: e.target.value.split(',').map(s => s.trim()).filter(s => s)})} />
                  </div>
                </td>
                <td className="py-4 px-4">
                  <input type="number" className="w-full bg-background border border-border p-2 text-xs" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </td>
                <td className="py-4 px-4">
                  <select className="w-full bg-background border border-border p-2 text-xs" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </td>
                <td className="py-4 px-4 text-right space-x-2">
                  <Button variant="ghost" size="icon" className="text-green-500" onClick={() => handleSave()}><Save size={16} /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setEditingId(null)}><X size={16} /></Button>
                </td>
              </tr>
            )}
            {products.map(p => (
              <tr key={p.id} className="border-b border-border hover:bg-white/5 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {(editingId === p.id ? (formData.images || []) : (p.images || [p.image_url])).slice(0, 3).map((img, idx) => (
                      <img 
                        key={idx}
                        src={getDirectImageUrl(img)} 
                        className="w-8 h-8 object-cover border border-border" 
                      />
                    ))}
                    {(editingId === p.id ? (formData.images || []) : (p.images || [p.image_url])).length > 3 && (
                      <div className="w-8 h-8 bg-muted flex items-center justify-center text-[8px] font-bold">
                        +{(editingId === p.id ? (formData.images || []) : (p.images || [p.image_url])).length - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 font-bold text-white">
                  {editingId === p.id ? (
                    <div className="flex flex-col gap-2">
                      <input className="w-full bg-background border border-border p-2 text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      <input className="w-full bg-background border border-border p-2 text-[10px]" placeholder="Sizes (S,M,L...)" value={formData.sizes?.join(',')} onChange={e => setFormData({...formData, sizes: e.target.value.split(',').map(s => s.trim()).filter(s => s)})} />
                      <input className="w-full bg-background border border-border p-2 text-[10px]" placeholder="Colors (Black,White...)" value={formData.colors?.join(',')} onChange={e => setFormData({...formData, colors: e.target.value.split(',').map(s => s.trim()).filter(s => s)})} />
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple
                          className="hidden" 
                          id={`file-upload-${p.id}`} 
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                        <label 
                          htmlFor={`file-upload-${p.id}`} 
                          className="flex items-center justify-center gap-2 bg-primary/20 border border-primary/30 py-2 text-[10px] uppercase font-bold cursor-pointer hover:bg-primary/30 transition-colors"
                        >
                          <Upload size={12} /> {uploading ? "Uploading..." : "Add/Change Images"}
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(formData.images || []).map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img src={getDirectImageUrl(img)} className="w-6 h-6 object-cover border border-primary" />
                            <button 
                              onClick={() => removeImage(idx)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={8} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : p.name}
                </td>
                <td className="py-4 px-4 text-white/70">
                  {editingId === p.id ? <input type="number" className="w-full bg-background border border-border p-2 text-xs" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} /> : `Rs. ${p.price.toLocaleString()}`}
                </td>
                <td className="py-4 px-4">
                  {editingId === p.id ? (
                    <select className="w-full bg-background border border-border p-2 text-xs" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  ) : <Badge className="bg-border text-white text-[8px] uppercase">{p.category}</Badge>}
                </td>
                <td className="py-4 px-4 text-right space-x-2">
                  {editingId === p.id ? (
                    <>
                      <Button variant="ghost" size="icon" className="text-green-500" onClick={() => handleSave(p.id)}><Save size={16} /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setEditingId(null)}><X size={16} /></Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" className="text-primary" onClick={() => { setEditingId(p.id); setFormData(p); }}><Edit size={16} /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(p.id)}><Trash size={16} /></Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminCategories = ({ categories, onRefresh, showToast }: { categories: Category[], onRefresh: () => void, showToast: (m: string, t?: 'success' | 'error') => void }) => {
  const [newCat, setNewCat] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async () => {
    if (!newCat) return;
    try {
      const { error } = await supabase.from('categories').insert([{ name: newCat }]);
      if (error) {
        console.error("Category Add Error:", error);
        throw error;
      }
      setNewCat("");
      await onRefresh();
      showToast("Category added successfully!");
    } catch (error: any) {
      showToast("Error adding category: " + error.message, 'error');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName) return;
    await supabase.from('categories').update({ name: editName }).eq('id', id);
    setEditingId(null);
    onRefresh();
    showToast("Category updated");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete category? This will not delete products in this category but they might not show up correctly.")) {
      await supabase.from('categories').delete().eq('id', id);
      onRefresh();
      showToast("Category deleted");
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <h3 className="text-xl font-bold text-white uppercase tracking-widest">Manage Categories</h3>
      <div className="flex gap-4">
        <input 
          className="flex-1 bg-background border border-border px-4 py-3 text-white focus:outline-none focus:border-primary" 
          placeholder="New Category Name"
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
        />
        <Button className="bg-primary text-white rounded-none px-8" onClick={handleAdd}>Add</Button>
      </div>
      <div className="space-y-2">
        {categories.map(c => (
          <div key={c.id} className="flex items-center justify-between p-4 border border-border hover:bg-white/5">
            {editingId === c.id ? (
              <input 
                className="flex-1 bg-background border border-border px-2 py-1 text-white text-xs mr-4"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                autoFocus
              />
            ) : (
              <span className="font-bold text-white uppercase tracking-widest text-xs">{c.name}</span>
            )}
            <div className="flex gap-2">
              {editingId === c.id ? (
                <>
                  <Button variant="ghost" size="icon" className="text-green-500" onClick={() => handleUpdate(c.id)}><Save size={16} /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setEditingId(null)}><X size={16} /></Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="icon" className="text-primary" onClick={() => { setEditingId(c.id); setEditName(c.name); }}><Edit size={16} /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(c.id)}><Trash size={16} /></Button>
                </>
              )}
            </div>
          </div>
        ))}
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
    if (confirm("Are you sure you want to delete this order record?")) {
      await supabase.from('orders').delete().eq('id', id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold text-white uppercase tracking-widest">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-[0.2em] text-primary">
              <th className="py-4 px-4">Order ID</th>
              <th className="py-4 px-4">Customer</th>
              <th className="py-4 px-4">Total</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4">Date</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.length === 0 ? (
              <tr><td colSpan={6} className="py-20 text-center text-muted-foreground uppercase tracking-widest text-[10px]">No orders found</td></tr>
            ) : orders.map(o => (
              <tr key={o.id} className="border-b border-border">
                <td className="py-4 px-4 font-mono text-[10px] text-primary">{o.id.slice(0, 8)}...</td>
                <td className="py-4 px-4 text-white">{o.customer_email}</td>
                <td className="py-4 px-4">
                  <div className="font-bold text-white">Rs. {o.total.toLocaleString()}</div>
                  <div className="text-[8px] text-muted-foreground uppercase mt-1">
                    {o.items?.map((item: any, i: number) => (
                      <div key={i}>
                        {item.quantity}x {item.name} 
                        {(item.size || item.color) && ` (${[item.size, item.color].filter(Boolean).join('/')})`}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Badge className={cn(
                    "border-none rounded-none uppercase text-[8px]",
                    o.status === 'completed' ? "bg-green-500/20 text-green-500" : 
                    o.status === 'pending' ? "bg-yellow-500/20 text-yellow-500" : 
                    "bg-blue-500/20 text-blue-500"
                  )}>
                    {o.status}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-white/50">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                  <select 
                    className="bg-background border border-border text-[10px] uppercase p-1 text-primary focus:outline-none"
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteOrder(o.id)}>
                    <Trash size={16} />
                  </Button>
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (email: string, pass: string, isSignUp: boolean) => {
    // --- ADMIN BYPASS ---
    // This allows you to log in even if Supabase is rate-limiting you
    if (email === "arshman15icloud@gmail.com" && pass === "arshman0123") {
      setUser({ email: "arshman15icloud@gmail.com", id: "admin-bypass" });
      setIsAccountOpen(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password: pass });
        if (error) throw error;
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

    try {
      const { error } = await supabase.from('orders').insert([{
        customer_email: user.email,
        total: cartTotal,
        status: 'pending',
        items: cart.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor
        }))
      }]);

      if (error) throw error;

      showToast("Order placed successfully!");
      setCart([]);
      setIsCartOpen(false);
    } catch (error: any) {
      showToast("Error placing order: " + error.message, 'error');
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
        {toast && (
          <div className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 border text-[10px] font-bold uppercase tracking-widest devil-glow animate-in fade-in slide-in-from-top-4",
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
        />

        <Routes>
          <Route path="/" element={<HomePage onAddToCart={addToCart} />} />
          <Route path="/products" element={<AllProductsPage onAddToCart={addToCart} />} />
          <Route path="/new-arrivals" element={<NewArrivalsPage onAddToCart={addToCart} />} />
          <Route path="/category/:categoryName" element={<CategoryPage onAddToCart={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetailPage onAddToCart={addToCart} />} />
          <Route path="/admin" element={<AdminPanel user={user} showToast={showToast} />} />
        </Routes>

        {/* Footer */}
        <footer className="bg-muted py-20 px-4 mt-20 border-t border-border">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
            <h2 className="text-4xl font-display tracking-tighter text-primary devil-text-glow">VERTEX LAB</h2>
            <p className="text-muted-foreground text-sm tracking-wide">High-end streetwear engineered for the modern aesthetic.</p>
            <div className="flex gap-8 text-[10px] font-bold tracking-widest uppercase text-primary">
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">TikTok</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">© 2024 VERTEX LAB. ALL RIGHTS RESERVED.</p>
          </div>
        </footer>

        <AccountModal 
          isOpen={isAccountOpen} 
          onClose={() => setIsAccountOpen(false)}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        {/* Cart Drawer */}
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetContent className="bg-background border-l border-border w-full sm:max-w-md p-0 flex flex-col">
            <SheetHeader className="p-6 border-b border-border flex-row items-center justify-between space-y-0">
              <SheetTitle className="text-xl font-display tracking-tighter uppercase text-primary">Bag</SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="text-primary hover:bg-primary/20">
                <X size={20} />
              </Button>
            </SheetHeader>
            
            <ScrollArea className="flex-1 p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 pt-20">
                  <ShoppingBag size={48} strokeWidth={1} className="text-primary" />
                  <p className="text-sm uppercase tracking-widest text-white">Your bag is empty</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {cart.map((item, idx) => (
                    <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`} className="flex gap-4">
                      <div className="w-24 aspect-[4/5] bg-muted shrink-0 overflow-hidden">
                        <img src={getDirectImageUrl(item.product.image_url)} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1 text-primary">{item.product.name}</h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {item.selectedSize && <span className="text-[8px] uppercase tracking-widest bg-white/5 px-2 py-0.5 border border-border text-white/50">Size: {item.selectedSize}</span>}
                            {item.selectedColor && <span className="text-[8px] uppercase tracking-widest bg-white/5 px-2 py-0.5 border border-border text-white/50">Color: {item.selectedColor}</span>}
                          </div>
                          <p className="text-sm font-bold text-white">Rs. {item.product.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-border">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-primary" onClick={() => updateQuantity(item.product.id, -1, item.selectedSize, item.selectedColor)}><Minus size={12} /></Button>
                            <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-primary" onClick={() => updateQuantity(item.product.id, 1, item.selectedSize, item.selectedColor)}><Plus size={12} /></Button>
                          </div>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}><Trash2 size={16} /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {cart.length > 0 && (
              <div className="p-6 border-t border-border space-y-4 bg-background">
                <div className="flex items-center justify-between text-sm font-bold uppercase tracking-widest">
                  <span className="text-primary">Subtotal</span>
                  <span className="text-white">Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <Button 
                  className="w-full bg-primary text-white hover:bg-primary/90 rounded-none py-6 font-bold uppercase tracking-[0.2em]"
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
              </div>
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
