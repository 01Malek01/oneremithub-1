
// Follow Deno Deploy runtime compatibility
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

// Create a Supabase client with the Admin key
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized: Missing valid authorization header",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Running historical rates aggregation function");

    // Track the start time for performance measurement
    const startTime = Date.now();
    const results = {
      standard_rates_aggregation: { success: false, message: "" },
      vertofx_rates_aggregation: { success: false, message: "" }
    };

    try {
      // Call the database function to aggregate standard historical rates
      const { data: standardRatesData, error: standardRatesError } = await supabase.rpc("aggregate_historical_rates_daily");
      
      if (standardRatesError) {
        console.error("Error running standard rates aggregation:", standardRatesError);
        results.standard_rates_aggregation = {
          success: false,
          message: `Failed: ${standardRatesError.message}`
        };
      } else {
        results.standard_rates_aggregation = {
          success: true,
          message: "Successfully aggregated standard historical rates"
        };
      }
    } catch (error) {
      console.error("Exception during standard rates aggregation:", error);
      results.standard_rates_aggregation = {
        success: false,
        message: `Exception: ${error.message}`
      };
    }

    try {
      // Call the database function to aggregate VertoFX historical rates
      const { data: vertoRatesData, error: vertoRatesError } = await supabase.rpc("aggregate_vertofx_historical_rates_daily");
      
      if (vertoRatesError) {
        console.error("Error running VertoFX rates aggregation:", vertoRatesError);
        results.vertofx_rates_aggregation = {
          success: false,
          message: `Failed: ${vertoRatesError.message}`
        };
      } else {
        results.vertofx_rates_aggregation = {
          success: true,
          message: "Successfully aggregated VertoFX historical rates"
        };
      }
    } catch (error) {
      console.error("Exception during VertoFX rates aggregation:", error);
      results.vertofx_rates_aggregation = {
        success: false,
        message: `Exception: ${error.message}`
      };
    }

    // Calculate execution time
    const executionTime = Date.now() - startTime;
    console.log(`Historical rates aggregation completed in ${executionTime}ms`);

    return new Response(
      JSON.stringify({
        success: results.standard_rates_aggregation.success || results.vertofx_rates_aggregation.success,
        results,
        timestamp: new Date().toISOString(),
        executionTimeMs: executionTime
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in aggregate-historical-data function:", error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Server error: ${error.message}`,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
