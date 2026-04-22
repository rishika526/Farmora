import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/lib/cart";
import { formatRupee } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function CartPage() {
  const { items, removeFromCart, clearCart } = useCart();
  const subtotal = items.reduce((sum, i) => sum + i.kit.price * i.quantity, 0);

  return (
    <div className="container px-4 py-10 min-h-screen">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Your Cart</h1>
          <p className="text-muted-foreground mt-2">Review your selected kits before checkout.</p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="max-w-2xl">
          <CardContent className="py-10 text-center space-y-4">
            <p className="text-lg font-medium">Your cart is empty.</p>
            <p className="text-muted-foreground">Go to the kits page and add products to see them here.</p>
            <Link href="/kits">
              <Button>Browse Kits</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-4">
            {items.map(({ kit, quantity }) => (
              <Card key={kit.id}>
                <CardContent className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={kit.image} alt={kit.name} className="h-16 w-16 rounded-lg object-cover bg-muted" />
                    <div>
                      <p className="font-semibold">{kit.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-primary">{formatRupee(kit.price * quantity)}</p>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(kit.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit">
            <CardContent className="py-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">{formatRupee(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span className="font-semibold">Free</span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary text-lg">{formatRupee(subtotal)}</span>
              </div>
              <Button className="w-full">Proceed to Checkout</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
