exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const payload = JSON.parse(event.body);
    const { phone, memberName, memberCode, stamps, stampTarget, rewardReady, rewardName } = payload;

    const token = process.env.WA_ACCESS_TOKEN;
    const phoneId = process.env.WA_PHONE_NUMBER_ID;
    const version = process.env.WA_API_VERSION || "v18.0";

    if (!token || !phoneId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "WhatsApp API variables not configured on server" }),
      };
    }

    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }

    let textMessage = `MATCHABEAN CLUB 🌿\n\nHalo ${memberName}!\n\nStamp kamu bertambah +1.\nTotal Stamp: ${stamps} / ${stampTarget}\nMember ID: ${memberCode}\n\n`;

    if (rewardReady) {
      textMessage += `🎉 REWARD READY!\nKamu sudah mendapatkan reward: ${rewardName}\n\nTunjukkan QR Code kamu ke kasir untuk klaim! 🍵`;
    } else {
      const remaining = stampTarget - stamps;
      textMessage += `Tinggal ${remaining} stamp lagi untuk mendapatkan reward ${rewardName}.\n\nTerima kasih sudah menjadi bagian dari Matchabean Club 💚`;
    }

    const response = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: { body: textMessage }
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
