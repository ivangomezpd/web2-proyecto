import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const motivationalPhrases = [
    "Descubre productos únicos que transformarán tu vida.",
    "La calidad que buscas, al alcance de un clic.",
    "Compra inteligente, vive mejor.",
    "Nuestros productos, tu satisfacción garantizada.",
    "Explora, compara y encuentra exactamente lo que necesitas."
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Bienvenido a SuperShop</h1>
      <div className="mb-8 flex justify-center">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-4 px-8 rounded-lg shadow-lg animate-bounce">
          Tailwind CSS está funcionando correctamente 🚀
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {motivationalPhrases.map((phrase, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <p className="text-lg font-semibold text-center">{phrase}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
