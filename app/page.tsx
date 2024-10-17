import Link from "next/link";
import { ArrowRight, Brain, Search, Layers, Smartphone } from "lucide-react";
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-700 to-red-500 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-yellow-200">
          Medical RAG Knowledge Base
        </h1>
        <p className="text-2xl mb-12 text-red-100">
          Unleash the power of AI in healthcare document retrieval.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <FeatureCard
            icon={<Brain className="w-10 h-10" />}
            title="AI-Powered Indexing"
            description="Lightning-fast document processing with cutting-edge AI."
          />
          <FeatureCard
            icon={<Search className="w-10 h-10" />}
            title="Vector Search"
            description="Find relevant info in milliseconds with vector-based search."
          />
          <FeatureCard
            icon={<Layers className="w-10 h-10" />}
            title="Smart Organization"
            description="Effortlessly manage documents with intelligent namespacing."
          />
          <FeatureCard
            icon={<Smartphone className="w-10 h-10" />}
            title="Responsive Design"
            description="Seamless experience across all your devices."
          />
        </div>

        <Link
          href="/pinecone"
          className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-red-900 bg-red-100 rounded-full hover:bg-white transition-colors duration-300 ease-in-out transform hover:scale-105"
        >
          Explore Knowledge Base
          <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300 ease-in-out" />
        </Link>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-red-800 bg-opacity-50 p-6 rounded-xl backdrop-blur-sm hover:bg-opacity-70 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
      <div className="flex items-center mb-4">
        {icon}
        <h2 className="text-xl font-bold ml-4">{title}</h2>
      </div>
      <p className="text-red-100">{description}</p>
    </div>
  );
}
