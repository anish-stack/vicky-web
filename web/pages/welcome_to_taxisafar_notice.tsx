import Head from 'next/head';

const NoticePage = () => {
    return (
        <>
            <Head>
                <title>Welcome to TaxiSafar</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <div style={{ marginTop: "100px" }}>
            <div className="message-box">
                <h1>Welcome To Taxi Safar</h1>

                <div className="lang-section">
                    <h2>ध्यान दें:</h2>
                    <p>
                टैक्सी सफर कंपनी को इस समय जितनी गाड़ियों और ड्राइवर पार्टनर्स की आवश्यकता थी, वह पूरी हो चुकी है।
                यदि आप अपनी गाड़ी टैक्सी सफर के साथ जोड़ना चाहते हैं, तो कृपया नीचे दिए गए &ldquo;रिक्वेस्ट बटन&rdquo; पर क्लिक करके अपनी रिक्वेस्ट सबमिट करें।
                <br />
                रिक्वेस्ट सबमिट करने के बाद, कृपया धैर्य रखें। जब भी कंपनी को नई गाड़ियों या ड्राइवर पार्टनर्स की आवश्यकता होगी, तो आपकी रिक्वेस्ट पर संपर्क किया जाएगा।
                <br />
                महत्वपूर्ण:
                रिक्वेस्ट सबमिट करने के बाद कंपनी को कॉल, मैसेज या ईमेल न करें।
                सिर्फ इंतजार करें – आवश्यकता होने पर टैक्सी सफर की टीम आपसे स्वयं संपर्क करेगी।
                <br />
                नोट: टैक्सी सफर में गाड़ी जोड़ने के लिए आपको कोई भी अमाउंट नहीं देना है। कृपया किसी को पैसा न दें – कंपनी की प्रक्रिया पूरी तरह मुफ्त है।
               

                        {/* TaxiSafar कंपनी को इस समय जितनी गाड़ियों और ड्राइवर पार्टनर्स की आवश्यकता थी, वह पूरी हो चुकी है। वर्तमान में कोई नई गाड़ी या ड्राइवर की आवश्यकता नहीं है।
                        <br />
                        कृपया कंपनी के मोबाइल नंबर या ईमेल पर कॉल या संपर्क न करें।
                        <br />
                        भविष्य में यदि TaxiSafar को नई गाड़ियों या ड्राइवरों की ज़रूरत होगी, तो आपको इसी पेज पर Get Started बटन के ज़रिए पूरी जानकारी दी जाएगी। */}
                    </p>
                  <div className="mt-2">
                    <a href="https://whatsform.com/jy4smm ">
                      <button className="taxisafar-theme-button">
                        Request <i className="fa-regular fa-arrow-right"> </i>
                      </button>
                    </a>
                  </div>
                </div>

                <div className="lang-section">
                    <h2>Notice:</h2>
                    <p>
                Taxi Safar has currently fulfilled its requirement for vehicles and driver partners.
                If you are interested in attaching your vehicle with us, kindly click on the “Request” button below and submit your details.
                <br />
                Once your request is submitted, please be patient. When there is a requirement in the future, our team will review your request and contact you accordingly.
                <br />
                Important:<br />
                Please do not call, message, or email the company after submitting your request.
                Simply wait — Taxi Safar will reach out to you if and when needed.
                <br />
                Note: There is no payment or fee required to attach your vehicle with Taxi Safar. Please do not pay anyone — our onboarding process is completely free.
                

{/* 
                        TaxiSafar has currently onboarded the required number of vehicles and driver partners. At this time, we are not accepting new vehicle or driver registrations.
                        <br />
                        Please do not call or contact the company via phone or email regarding vehicle attachment.
                        <br />
                        If there is any requirement in the future, all details will be updated right here through this Get Started button. */}
                    </p>
              <div className="mt-2">
                <a href="https://whatsform.com/jy4smm ">
                  <button className="taxisafar-theme-button">
                    Request <i className="fa-regular fa-arrow-right"> </i>
                  </button>
                </a>
              </div>
                </div>
            </div>
            </div>

            <style jsx>{`
        body {
          font-family: Arial, sans-serif;
          background-color: #f6f6f6;
          margin: 0;
          padding: 20px;
        }
        .message-box {
          background-color: #ffffff;
          border: 1px solid #cccccc;
          border-radius: 10px;
          padding: 25px;
          max-width: 700px;
          margin: 40px auto;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        }
        h1 {
          text-align: center;
          color: #2c3e50;
          margin-top: 0;
        }
        h2 {
          color: #d32f2f;
          margin-top: 30px;
        }
        p {
          line-height: 1.6;
          color: #333333;
        }
        .lang-section {
          margin-bottom: 30px;
        }
      `}</style>
        </>
    );
};

export default NoticePage;
