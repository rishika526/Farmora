import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface QuantumToggleProps {
  enabled: boolean;
  onToggle: (val: boolean) => void;
}

export default function QuantumToggle({ enabled, onToggle }: QuantumToggleProps) {
  return (
    <div className={`flex items-center space-x-3 p-3 rounded-2xl transition-all duration-500 border ${enabled ? 'bg-primary/5 border-primary/20 shadow-[0_0_15px_rgba(0,119,51,0.1)]' : 'bg-muted/30 border-transparent'}`}>
      <Switch 
        id="quantum-mode" 
        checked={enabled}
        onCheckedChange={onToggle}
        className={enabled ? "data-[state=checked]:bg-primary" : ""}
      />
      <Label htmlFor="quantum-mode" className="flex items-center gap-2 cursor-pointer font-medium">
        <Sparkles className={`w-4 h-4 transition-colors ${enabled ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
        <span className={enabled ? 'text-primary' : 'text-muted-foreground'}>
          Quantum Optimized
        </span>
      </Label>
      {enabled && (
        <motion.span 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full"
        >
          Active
        </motion.span>
      )}
    </div>
  );
}
