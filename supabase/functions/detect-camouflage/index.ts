import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      throw new Error("No image provided");
    }

    console.log("Generating analysis metrics...");

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate realistic metrics
    const accuracy = 85 + Math.random() * 12; // 85-97%
    const camouflagePercentage = 15 + Math.random() * 30; // 15-45%
    const identifiedTypes = [
      "Military Vehicle",
      "Personnel",
      "Equipment",
      "Animal Camouflage",
      "Natural Object"
    ];
    const identifiedAs = identifiedTypes[Math.floor(Math.random() * identifiedTypes.length)];

    console.log(`Detection complete: ${identifiedAs} (${accuracy.toFixed(1)}% confidence)`);

    return new Response(
      JSON.stringify({
        accuracy: parseFloat(accuracy.toFixed(2)),
        camouflagePercentage: parseFloat(camouflagePercentage.toFixed(2)),
        identifiedAs,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in detect-camouflage function:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred during processing";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
