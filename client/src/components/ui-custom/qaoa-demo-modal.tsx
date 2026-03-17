import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Cpu, Activity } from "lucide-react";
import { useState, useEffect } from "react";

const mockData = [
  { name: "00000", prob: 0.02 },
  { name: "00001", prob: 0.05 },
  { name: "00010", prob: 0.01 },
  { name: "01010", prob: 0.12 },
  { name: "01101", prob: 0.45 }, // Optimal state
  { name: "10000", prob: 0.04 },
  { name: "10101", prob: 0.15 },
  { name: "11111", prob: 0.08 },
];

export default function QAOADemoModal() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [data, setData] = useState<{name: string, prob: number}[]>([]);

  useEffect(() => {
    if (isSimulating) {
      setData([]);
      const timer = setTimeout(() => {
        setData(mockData);
        setIsSimulating(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSimulating]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5 rounded-full">
          <Cpu className="w-4 h-4" />
          Run Quantum Demo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Activity className="w-6 h-6 text-primary" />
            QAOA Simulation
          </DialogTitle>
          <DialogDescription>
            Simulating Quantum Approximate Optimization Algorithm (QAOA) via Qiskit.
            Finding the optimal subset of recommendations by solving the QUBO formulation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 h-[300px] w-full flex flex-col items-center justify-center bg-muted/20 rounded-2xl border border-border/50">
          {!data.length && !isSimulating ? (
             <Button onClick={() => setIsSimulating(true)} className="rounded-full px-8 bg-primary hover:bg-primary/90">
               Initialize Quantum Circuit
             </Button>
          ) : isSimulating ? (
            <div className="flex flex-col items-center gap-4 text-primary">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Running on Simulator...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="prob" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.prob > 0.4 ? 'hsl(155, 100%, 23%)' : 'hsl(150, 15%, 85%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {data.length > 0 && (
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-sm text-foreground">
            <p><strong>Optimal State Found:</strong> <span className="font-mono text-primary">|01101⟩</span></p>
            <p className="text-muted-foreground mt-1">This bitstring maps to the exact subset of tutorials that maximizes relevance while maintaining category diversity.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
