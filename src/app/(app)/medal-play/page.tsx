import { Card, CardContent } from "@/components/ui/card";

export default function MedalPlayPage() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <span className="inline-block h-3 w-3 rounded-full bg-accent-400" />
      <h1 className="font-serif text-2xl font-semibold text-primary-900">Medal Play</h1>
      <Card className="max-w-md">
        <CardContent>
          <p className="text-muted">
            Próximamente. El ranking de Medal Play todavía está en desarrollo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
