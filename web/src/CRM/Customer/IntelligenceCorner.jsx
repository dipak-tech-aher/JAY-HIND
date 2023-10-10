import React,{useState, useEffect} from 'react'
import robotai1 from "../../assets/images/robot-ai-sett.svg";
import robotai2 from "../../assets/images/robot-ai-idea.svg";
import Slider from "react-slick";

const settings = {
  dots: true,
  infinite: true,
  arrows: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  initialSlide: 0,
  responsive: [
      {
          breakpoint: 1024,
          settings: {
              slidesToShow: 3,
              slidesToScroll: 3,
              infinite: true,
              dots: false
          }
      },
      {
          breakpoint: 600,
          settings: {
              slidesToShow: 2,
              slidesToScroll: 2,
              initialSlide: 2
          }
      },
      {
          breakpoint: 480,
          settings: {
              slidesToShow: 1,
              slidesToScroll: 1
          }
      }
  ]
};

const IntelligenceCorner = ((props)=> {
    const interactionData = props?.data?.interactionData
    const customerData = props?.data?.customerData
    const servicesList = props?.data?.servicesList
    const [sentiment, setSentiment] =  useState();
    const [customerFinalData, setCustomerFinalData] = useState([])
    const [statusEl, setStatusEl] = useState("Model Loaded");
    let submitBtn;
    const [inputBox, setInputBox]= useState("");
    const [sentimentResult, setSentimentResult] = useState([]);
    const [originalText, setOriginalText] =  useState();
    const [predictionText, setPredictionText] =  useState();
    const [charRNN, setCharRNN] =  useState();

    // useEffect(() =>{
    //   let res =0
    //   setSentiment(ml5.sentiment('movieReviews', 'model loaded'));
    //   if(interactionData.length > 0 && sentiment){
       
    
    //   for(const i of interactionData){
    //     console.log(i)
    //     const prediction = sentiment.predict(i.intxnType?.description);
    //     console.log('prediction=', prediction)
    //     res+=Number(prediction.score)
        
    //   } 
    //   console.log('result is =', res)
    //   setSentimentResult(res/interactionData.length);
    //   }
      
      
    // },[interactionData])

const intelligenceList = props?.data?.intelligenceList

    return(
      <div className="skel-ai-sect">                                                        
      <div className="skel-ai-cnt">
          <div className="skel-placeholder-loader">
              <div className="skel-ai-img">
                  <img src={robotai1} alt="" className="img-fluid hide" width="150" height="150" />
                  <img src={robotai2} alt="" className="img-fluid skel-loading-animation show" width="120" height="120" />
                  <span className="ai-shadow"></span>
              </div>
              <div className="skel-cell-loader">
              <span>{statusEl}</span> 
                
                <input type="text" value={inputBox} id="sentimentText"
                 onChange={(e) => {
                    setInputBox(e.target.value)                   
                    }}
                />
              {/* <button id="subBtn" onClick={generate}>Get sentiment</button><br/> */}
              <span>Customer mood is {Number(sentimentResult).toFixed(2)*100} %</span> <br/>
              <span>Original text {originalText} </span> <br/>
              <span>Predicted text is {predictionText} </span> <br/>
              {/* <Slider {...settings}>
                {
                    intelligenceList && intelligenceList.map((val, idx) => (
                        <div className="skel-loader">
                            <div className="skel-cnt-load skel-ai-bot-cnt">
                              <span className="skel-profile-name">{val?.type}</span>
                              <p className="skel-slick-cnt">
                                <span>{val?.message}</span>
                                {
                                  val?.data.length >0 && val?.data.map((val2, idx2)=>(
                                    // <span className="skel-profile-name">{val2}</span>
                                    <></>
                                  ))
                                }
                              </p>
                            </div>
                        </div>
                    ))
                }
            </Slider> */}
                  {/* <div className="slider">
                      <div className="slide">
                          <div className="skel-loader">                                           
                              <div className="skel-cnt-load skel-ai-bot-cnt">
                                  <span className="skel-profile-name">
                                      &#128512; Valuable Customer</span>
                                  <span>Created on: 14 Mar, 2023</span>
                                  <p className="skel-slick-cnt">                                                                                
                                      <span>Statement Comes HereStatement Comes HereStatement Comes Here</span>
                                      <span className="skel-h-status">High</span>
                                  </p>
                              </div>
                          </div>
                      </div>
                      <div className="slide">
                          <div className="skel-loader">                                           
                              <div className="skel-cnt-load hide skel-ai-bot-cnt">
                                  <span className="skel-profile-name"><img src="./assets/images/discount-offer.gif" alt="" className="skel-ai-gif"/>Recommended Offers</span>
                                  <p className="skel-slick-cnt">                                                                                
                                      <span>15GB Extra on Great Saving plans</span>                                                                                      
                                  </p>
                              </div>
                          </div>
                      </div>
                      <div className="slide">
                          <div className="skel-loader">                                           
                              <div className="skel-cnt-load hide skel-ai-bot-cnt">
                                  <span className="skel-profile-name">
                                      <img src="./assets/images/services.gif" alt="" className="skel-ai-gif"/>Popular Services</span>
                                  <p className="skel-slick-cnt"> 
                                      <span>Plan A- With bundle package</span>
                                  </p>
                                  <p className="skel-slick-cnt">
                                      <span>Plan B- With bundle package</span>
                                  </p>
                              </div>
                          </div>
                      </div>
                      <div className="slide">
                          <div className="skel-loader">                                           
                              <div className="skel-cnt-load hide skel-ai-bot-cnt">
                                  <span className="skel-profile-name">
                                      <img src="./assets/images/calendar.gif" alt="" className="skel-ai-gif"/>Locations Based Appointments</span>
                                  <p className="skel-slick-cnt"> 
                                      <span>Brunei 1</span>
                                  </p>
                                  <p className="skel-slick-cnt">
                                      <span>Brunei 2</span>
                                  </p>
                              </div>
                          </div>
                      </div>
                      <div className="slide">
                          <div className="skel-loader">                                           
                              <div className="skel-cnt-load hide skel-ai-bot-cnt">
                                  <span className="skel-profile-name">
                                      <img src="./assets/images/birthday-cake.gif" alt="" className="skel-ai-gif"/> Happy Birthday</span>
                                  <span>14 Mar, 2023</span>
                                  <p className="skel-slick-cnt">                                                                                
                                      <span>Statement Comes HereStatement Comes HereStatement Comes Here</span>
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>  */}
              </div>                                                            
          </div>
      </div>
  </div>
    )
})
export default IntelligenceCorner;

        
       

