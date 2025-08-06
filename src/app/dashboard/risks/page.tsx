import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RisksPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Manajemen Risiko</h2>
      <Card>
        <CardHeader>
          <CardTitle>Halaman Dalam Pengembangan</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Fitur untuk manajemen risiko akan segera tersedia.</p>
        </CardContent>
      </Card>
    </div>
  );
}
