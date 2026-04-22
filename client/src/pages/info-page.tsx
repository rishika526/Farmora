interface InfoPageProps {
  title: string;
  description: string;
}

export default function InfoPage({ title, description }: InfoPageProps) {
  return (
    <div className="container px-4 py-12 min-h-screen">
      <div className="max-w-3xl space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
