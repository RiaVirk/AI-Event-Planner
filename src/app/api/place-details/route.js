// app/api/place-details/route.js

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query)
    return Response.json({ error: "No query provided" }, { status: 400 });

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  console.log("=== NEW PLACES API ===");
  console.log("Query:", query);
  console.log("API Key present:", !!apiKey);

  try {
    const searchRes = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.currentOpeningHours,places.priceLevel",
        },
        body: JSON.stringify({ textQuery: query }),
      },
    );

    const searchData = await searchRes.json();
    console.log("Response:", JSON.stringify(searchData));

    const place = searchData.places?.[0];
    if (!place) return Response.json({});

    const priceLevelMap = {
      PRICE_LEVEL_FREE: 0,
      PRICE_LEVEL_INEXPENSIVE: 1,
      PRICE_LEVEL_MODERATE: 2,
      PRICE_LEVEL_EXPENSIVE: 3,
      PRICE_LEVEL_VERY_EXPENSIVE: 4,
    };

    return Response.json({
      name: place.displayName?.text,
      formatted_address: place.formattedAddress,
      website: place.websiteUri,
      formatted_phone_number: place.nationalPhoneNumber,
      rating: place.rating,
      user_ratings_total: place.userRatingCount,
      price_level: priceLevelMap[place.priceLevel],
      opening_hours: {
        open_now: place.currentOpeningHours?.openNow,
        weekday_text: place.currentOpeningHours?.weekdayDescriptions,
      },
    });
  } catch (err) {
    console.error("Places API error:", err);
    return Response.json(
      { error: "Failed to fetch place details" },
      { status: 500 },
    );
  }
}
