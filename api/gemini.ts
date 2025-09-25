import { GoogleGenAI, Type } from "@google/genai";

// Schemas are now securely stored on the backend, using the correct Enum types
const Schemas = {
    GET_RESTAURANTS: {
        type: Type.OBJECT,
        properties: {
            restaurants: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "餐廳的唯一識別碼。" },
                        name: { type: Type.STRING },
                        category: { type: Type.STRING },
                        rating: { type: Type.NUMBER },
                        reviews: { type: Type.INTEGER },
                        deliveryTime: { type: Type.STRING },
                        minOrder: { type: Type.INTEGER },
                        image: { type: Type.STRING, description: "一個來自 picsum.photos 的 URL，例如：https://picsum.photos/500/300" },
                    },
                    required: ["id", "name", "category", "rating", "reviews", "deliveryTime", "minOrder", "image"],
                },
            },
        },
    },
    GET_MENU: {
        type: Type.OBJECT,
        properties: {
            menu: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        price: { type: Type.NUMBER },
                        restaurantName: { type: Type.STRING, description: "此品項所屬的餐廳名稱。" }
                    },
                    required: ["id", "name", "price", "restaurantName"],
                },
            },
        },
    },
    PROCESS_ORDER: {
        type: Type.OBJECT,
        properties: {
            orderNumber: { type: Type.STRING },
            estimatedDeliveryTime: { type: Type.STRING },
        },
        required: ["orderNumber", "estimatedDeliveryTime"],
    }
};

// Vercel Serverless Function handler
export default async function handler(request: any, response: any) {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        console.error("API_KEY environment variable not set");
        return response.status(500).json({ error: 'Server configuration error.' });
    }
    
    if (request.method !== 'POST') {
        response.setHeader('Allow', ['POST']);
        return response.status(405).json({ error: `Method ${request.method} Not Allowed` });
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const { type, ...payload } = request.body;
        let contents;
        let schema;

        switch (type) {
            case 'GET_RESTAURANTS':
                contents = "請為一個美食外送 App 生成一個包含8家多樣化且吸引人的虛構餐廳列表。請以繁體中文提供詳細資訊，例如：唯一的 id、名稱、類別、評分(介於3.5到5.0之間)、評論數、外送時間預估、最低訂單金額，以及一個來自 picsum.photos 的佔位圖片 URL (e.g., https://picsum.photos/500/300?random=1)。";
                schema = Schemas.GET_RESTAURANTS;
                break;

            case 'GET_MENU':
                const { restaurantName, restaurantCategory } = payload;
                if (!restaurantName || !restaurantCategory) throw new Error("Missing parameters for GET_MENU");
                contents = `請為名為 "${restaurantName}" 的餐廳生成一份包含6個品項的真實菜單。餐廳的類別是 "${restaurantCategory}"。對於每個品項，請提供唯一的 ID、名稱和價格。每個品項都應包含餐廳名稱以供參考。請使用繁體中文回答。`;
                schema = Schemas.GET_MENU;
                break;
            
            case 'PROCESS_ORDER':
                const { orderDetails, cart } = payload;
                if (!orderDetails || !cart) throw new Error("Missing parameters for PROCESS_ORDER");
                contents = `一位顧客下了一張美食外送訂單。顧客資料: ${JSON.stringify(orderDetails)}。訂單品項: ${cart.map((item: any) => `${item.name} x${item.quantity}`).join(', ')}。請根據這些資訊，生成一個唯一的訂單編號（格式：ORD-XXXXXX）和一個真實的預計送達時間（例如：25-35 分鐘）。`;
                schema = Schemas.PROCESS_ORDER;
                break;
            
            default:
                return response.status(400).json({ error: 'Invalid request type.' });
        }

        const genAIResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        
        const json = JSON.parse(genAIResponse.text);
        return response.status(200).json(json);

    } catch (error) {
        console.error("Error in Gemini API call:", error);
        const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
        return response.status(500).json({ error: errorMessage });
    }
}