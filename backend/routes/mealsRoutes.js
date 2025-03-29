const express = require("express");
const router = express.Router();
const { supabase } = require("../lib/supabaseClient");

// For production, these would come from environment variables
const SID = process.env.SID;
const cantine_number = process.env.CANTINE_NUMBER;
const username = process.env.USER_NAME;

/**
 * API ENDPOINTS
 */

/**
 * GET /obedy - Get all meals from local database
 */
router.get("/obedy", async (req, res) => {
  try {
    const mealsData = await getMealsFromDatabase();

    if (mealsData.error) {
      return res.status(500).json({ error: mealsData.error });
    }

    return res.status(200).json({
      success: true,
      message: "Meals successfully retrieved from database",
      data: mealsData.data || [],
    });
  } catch (err) {
    console.error("Unexpected error in GET /obedy:", err);
    return res.status(500).json({
      success: false,
      error: `An unexpected error occurred: ${err.message}`,
    });
  }
});

router.get("/sync", syncHandler);

/**
 * Support both GET and POST for /sync - Fetch meals from external API and save to database
 */
async function syncHandler(req, res) {
  try {
    console.log(`Processing ${req.method} request to /sync endpoint`);

    // Step 1: Fetch meals from API
    const apiResponse = await makeRequest();

    if (!apiResponse.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to fetch meals from source",
        details: apiResponse.error,
      });
    }

    // Step 2: Insert meals into database
    const insertResult = await insertMeals(apiResponse.data);

    // Step 3: Respond with appropriate result
    if (insertResult.success) {
      return res.status(200).json({
        success: true,
        message: "Meals fetched and saved successfully",
        count: insertResult.count,
        totalMeals: insertResult.totalMeals,
        failures: insertResult.failures || 0,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Failed to insert meals",
        details: insertResult.error,
      });
    }
  } catch (error) {
    console.error("Complete process error:", error);
    return res.status(500).json({
      success: false,
      error: `An unexpected error occurred: ${
        error.message || "Unknown error"
      }`,
    });
  }
}

router.get("/saveOrders", async (req, res) => {
  // Test order data
  const testOrders = [{ date: "2025-04-03", type: "1", pocet: "0" }]; // 03.4.2025

  // Add testOrders to req.body
  req.body = { orders: testOrders };

  try {
    const response = await saveOrdersHandler(req);

    if (response && response.success) {
      return res
        .status(200)
        .json({ message: "Save orders endpoint", data: response });
    } else {
      return res.status(500).json({
        message: "Failed to save orders",
        error: response?.error || "Unknown error",
      });
    }
  } catch (error) {
    console.error("Error in /saveOrders route:", error);
    return res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message || "Unknown error",
    });
  }
});

async function saveOrdersHandler(req) {
  try {
    // Get order data from request
    const { orders } = req.body;

    console.log("Received orders:", orders);

    if (!orders || !Array.isArray(orders)) {
      return {
        success: false,
        error: "Invalid request format. Expected an array of orders.",
      };
    }

    // Build XML payload
    let xmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<VFPData>
    <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:msdata="urn:schemas-microsoft-com:xml-msdata" id="VFPData">
        <xsd:element name="VFPData" msdata:IsDataSet="true">
            <xsd:complexType>
                <xsd:choice maxOccurs="unbounded">
                    <xsd:element name="rozpisobjednavek" minOccurs="0" maxOccurs="unbounded">
                        <xsd:complexType>
                            <xsd:sequence>
                                <xsd:element name="datum" type="xsd:date" />
                                <xsd:element name="druh">
                                    <xsd:simpleType>
                                        <xsd:restriction base="xsd:string">
                                            <xsd:maxLength value="1" />
                                        </xsd:restriction>
                                    </xsd:simpleType>
                                </xsd:element>
                                <xsd:element name="pocet">
                                    <xsd:simpleType>
                                        <xsd:restriction base="xsd:decimal">
                                            <xsd:totalDigits value="5" />
                                            <xsd:fractionDigits value="0" />
                                        </xsd:restriction>
                                    </xsd:simpleType>
                                </xsd:element>
                            </xsd:sequence>
                        </xsd:complexType>
                    </xsd:element>
                </xsd:choice>
                <xsd:anyAttribute namespace="http://www.w3.org/XML/1998/namespace" processContents="lax" />
            </xsd:complexType>
        </xsd:element>
    </xsd:schema>`;

    // Function to format date (already correct)
    function formatDate(dateStr) {
      return dateStr;
    }

    // Add order entries to XML
    for (const order of orders) {
      const formattedDate = formatDate(order.date);
      xmlPayload += `
    <rozpisobjednavek>
        <datum>${formattedDate}</datum>
        <druh>${order.type}</druh>
        <pocet>${order.pocet}</pocet>
    </rozpisobjednavek>`;
    }

    // Close XML
    xmlPayload += `
</VFPData>`;

    // Final XML without extra escaping
    const finalXml = `"${xmlPayload}"`;

    console.log(finalXml);

    console.log("Escaped XML Payload:", finalXml);

    const url = "https://app.strava.cz/api/saveOrders";

    // Prepare headers
    const headers = {
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "cs-CZ,cs;q=0.9",
      "content-type": "text/plain;charset=UTF-8",
      cookie: `NEXT_LOCALE=cs; cislo=${cantine_number}; jmeno=${username}; sid=${SID}; multiContextSession=%7B%22printOpen%22%3A%7B%22value%22%3Afalse%2C%22expiration%22%3A-1%7D%7D`,
      origin: "https://app.strava.cz",
      referer: "https://app.strava.cz/",
      "sec-ch-ua": '"Chromium";v="134", "Not:A-Brand";v="24", "Brave";v="134"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
    };

    // Prepare payload
    const payload = {
      cislo: cantine_number,
      sid: SID,
      url: "",
      lang: "CZ",
      xlm: finalXml,
      ignoreCert: "false",
    };

    // Make request to save orders
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    console.log(response);

    // Handle response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `API returned error status ${response.status}: ${errorText.substring(
          0,
          150
        )}...`
      );
      return {
        success: false,
        error: `API returned status ${response.status}`,
        details: errorText.substring(0, 500),
      };
    }

    // Process successful response
    const responseData = await response.json();
    return {
      success: true,
      message: "Orders successfully saved",
      data: responseData,
    };
  } catch (error) {
    console.error("Error saving orders:", error);
    return {
      success: false,
      error: error.message || "Unknown error during order saving",
    };
  }
}

/**
 * DATABASE OPERATIONS
 */

// Get meals from database
async function getMealsFromDatabase() {
  try {
    // Check if Supabase client is properly initialized
    if (!supabase) {
      console.error("Supabase client is not initialized");
      return { error: "Database connection not available" };
    }

    // Query the database
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .order("date", { ascending: false });

    // Handle Supabase errors
    if (error) {
      console.error("Supabase error:", error);
      return { error: `Database error: ${error.message}` };
    }

    return { data };
  } catch (err) {
    console.error("Error getting meals from database:", err);
    return { error: err.message };
  }
}

// Helper function to make the request to the Strava.cz API
async function makeRequest() {
  try {
    const url = "https://app.strava.cz/api/objednavky";

    // All headers from the example
    const headers = {
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "cs-CZ,cs;q=0.9",
      "content-length": "103",
      "content-type": "text/plain;charset=UTF-8",
      cookie: `NEXT_LOCALE=cs; cislo=${cantine_number}; jmeno=${username}; sid=a4ecc0fb14c70b8ef87da8bcd63ff8e1a98ffa43c00d9a809430abfb80cc020d9bb6adb4ce12bdf2a3efd907eb4b6e4da811984bebd242f137b91ff1b3391f97; multiContextSession=%7B%22printOpen%22%3A%7B%22value%22%3Afalse%2C%22expiration%22%3A-1%7D%7D`,
      origin: "https://app.strava.cz",
      priority: "u=1, i",
      referer: "https://app.strava.cz/",
      "sec-ch-ua": '"Chromium";v="134", "Not:A-Brand";v="24", "Brave";v="134"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
    };

    const payload = {
      cislo: cantine_number,
      sid: SID,
      s5url: "",
      lang: "CZ",
      konto: 0,
      podminka: "",
      ignoreCert: "false",
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    // Check if response is OK (status in the range 200-299)
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `API returned error status ${response.status}: ${errorText.substring(
          0,
          150
        )}...`
      );
      return {
        success: false,
        error: `API returned status ${response.status}`,
        details: errorText.substring(0, 500),
      };
    }

    // Check content type to ensure it's JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text();
      console.error("API did not return JSON. Content type:", contentType);
      console.error("Response preview:", responseText.substring(0, 150));
      return {
        success: false,
        error: "API did not return JSON data",
        contentType: contentType || "unknown",
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error making request:", error);
    return {
      success: false,
      error: error.message || "Unknown error during API request",
    };
  }
}

async function insertMeals(mealsData) {
  try {
    // Helper function: convert from "25.03.2025" to "2025-03-25"
    function convertDateFormat(dateStr) {
      const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dateStr);
      if (!match) return null;
      const [, day, month, year] = match;
      return `${year}-${month}-${day}`;
    }

    // Process all table data from the API response
    const allMeals = [];

    // Handle the case where mealsData might be directly an object with table0, table1, etc.
    if (typeof mealsData === "object" && mealsData !== null) {
      // If mealsData has table properties directly
      Object.keys(mealsData)
        .filter(
          (key) => key.startsWith("table") && Array.isArray(mealsData[key])
        )
        .forEach((key) => {
          allMeals.push(...mealsData[key]);
        });
    }
    // Handle the case where mealsData might be in data.table0, data.table1, etc.
    else if (
      mealsData &&
      typeof mealsData.data === "object" &&
      mealsData.data !== null
    ) {
      Object.keys(mealsData.data)
        .filter(
          (key) => key.startsWith("table") && Array.isArray(mealsData.data[key])
        )
        .forEach((key) => {
          allMeals.push(...mealsData.data[key]);
        });
    }

    if (allMeals.length === 0) {
      console.warn("No valid table data found in the API response");
      return {
        success: false,
        count: 0,
        message: "No valid meals found in the API response",
      };
    }

    const formattedMeals = allMeals
      .filter((meal) => meal && meal.nazev && meal.nazev.length >= 2)
      .map((meal) => {
        const formattedDate = convertDateFormat(meal.datum);
        return {
          date: formattedDate,
          type: meal.druh,
          name: meal.nazev,
          price: parseFloat(meal.cena || "0.00"),
          database_source: meal.databaze || "S4",
          order_end_time:
            meal.casOdhlaseni && meal.casOdhlaseni !== "9999-12-31T00:00:00"
              ? meal.casOdhlaseni
              : null,
          is_ordered: meal.pocet > 0,
        };
      })
      .filter((meal) => meal.date !== null); // Remove entries with invalid dates

    if (formattedMeals.length === 0) {
      console.warn("No valid meals found after formatting");
      return {
        success: true,
        count: 0,
        message: "No valid meals found to insert",
      };
    }

    // Insert meals into the database
    const results = [];
    for (const meal of formattedMeals) {
      try {
        // Ensure price is a valid number
        if (isNaN(meal.price)) {
          meal.price = 0.0;
        }

        const { data, error } = await supabase.from("meals").upsert(
          {
            date: meal.date,
            type: meal.type,
            name: meal.name,
            price: meal.price,
            database_source: meal.database_source,
            order_end_time: meal.order_end_time,
            is_ordered: meal.is_ordered,
            updated_at: new Date(),
          },
          {
            onConflict: "date,type,name",
            returning: "minimal",
          }
        );

        if (error) {
          console.error(`Error inserting meal: ${meal.name}`, error);
          results.push({ meal, success: false, error });
        } else {
          results.push({ meal, success: true });
        }
      } catch (err) {
        console.error(`Exception inserting meal: ${meal.name}`, err);
        results.push({ meal, success: false, error: err });
      }
    }

    const failures = results.filter((r) => !r.success);

    if (failures.length > 0) {
      console.error(`${failures.length} meals failed to insert`);
    }

    const successCount = results.filter((r) => r.success).length;

    return {
      success: true,
      count: successCount,
      totalMeals: formattedMeals.length,
      failures: failures.length,
    };
  } catch (error) {
    console.error("Unexpected error during meal insertion:", error);
    return {
      success: false,
      error: error.message || "Unknown error during meal insertion",
    };
  }
}

module.exports = router;
