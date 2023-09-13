import { process } from "./env"
import { Configuration, OpenAIApi} from 'openai'
import * as Sentiment from 'sentiment';

const setupTextarea = document.getElementById('setup-textarea') 
const setupInputContainer = document.getElementById('setup-input-container')
const elonText = document.getElementById('elon-text')

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)

const apiKey = process.env.OPENAI_API_KEY

// Define a function to analyze sentiment
function analyzeSentiment(userMessage) {

  let sentiment = new Sentiment();
  var result = sentiment.analyze(userMessage);
  console.log(result); 
  // Determine the sentiment (positive, negative, or neutral) based on sentimentResult
  // Replace this with logic specific to your library's output
  if (result.score > 0) {
    return 'positive';
  } else if (result.score < 0) {
    return 'negative';
  } else {
    return 'neutral';
  }
}

document.getElementById("send-btn").addEventListener("click", () => {
    if (setupTextarea.value) {
      const userInput = setupTextarea.value
      setupInputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`
      elonText.innerText = `Ok, just wait a second while my digital brain digests that...`
      fetchBotReply(userInput)
      fetchSynopsis(userInput)
    }
  })
  
  async function fetchBotReply(outline) {
    const sentiment = analyzeSentiment(outline);

    // Adjust the prompt based on sentiment
    let prompt = '';
    if (sentiment === 'positive') {
      prompt = `Generate a short message to enthusiastically say "${outline}" sounds interesting and that you need some minutes to think about it. Mention one aspect of the sentence.`;
    } else if (sentiment === 'negative') {
      prompt = `Generate a message to empathetically respond to "${outline}" and express understanding. Mention one aspect of the sentence.`;
    } else {
      prompt = `Generate a response which is very formal to "${outline}" and mention one aspect of the sentence. Mention formally, you need a minute to gather your thoughts`;
    }

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens:60
    })
    elonText.innerText = response.data.choices[0].text.trim()
    console.log(response)
  } 

  async function fetchSynopsis(outline) {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Generate an engaging, professional and marketable car feature breakdown that would be found on auto show brochures based on an outline.
      ###
      outline: A flying tesla SUV with giant wings and wheels.
      synopsis: The Tesla Monster X is a flying SUV with monster wheels and the largest legal flying car wings for maximum comfort. There are additional models which are variations of the base Monster X including: Monster Xs (Seats 8 instead of 5), Monster Y (Jeep Variant), and Monster Meg (Includes a transformation option into a boat). The Tesla Monster X has the interior of the future, with 17" touchscreen, yoke steering, and a 960-watt audio system.

      Below are some of the specifications:
      Engine: Electric Motor (670hp / 500kW)
      Transmission: 60D
      Battery: 100kwh
      Curb Weight: 5148 lbs
      0-100km/h: 2.6s
      Cargo: 50L

      The Tesla Monster X is the future of all flying cars, with a luxurious interior and sleek exterior, allowing every to use. 
      ###
      outline: ${outline}
      synopsis: `,
      max_tokens: 700,
      temperature: 0.7
    })    
    const carModel = response.data.choices[0].text.trim()
    document.getElementById('output-text').innerText = carModel
    fetchTitle(carModel)
    fetchModels(carModel)
  }

  async function fetchTitle(carModel) {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Generate a car model which is only 2 to 4 words that would make sense for this car description: ${carModel} For example, I expect things like "Ford F150, Tesla K, Lamborgini Pentiaga, something like that.
      ###
      carModel:`,
      max_tokens: 15,
      temperature: 0.5
    })
    const title = response.data.choices[0].text.trim()
    document.getElementById('output-title').innerText = title
    fetchImagePrompt(title, carModel)
  }
  
  async function fetchModels(synopsis){
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Extract the different models of cars from the synopsis, or if there is not any models, create more of your own which is similar to the original model. Remember, do not extract whats inside the brackets, just the model itself is good. Also, there should be a maximum of 3 and minimum of 1.
      ###
      synopsis: The Tesla Monster X is a flying SUV with monster wheels and the largest legal flying car wings for maximum comfort. There are additional models which are variations of the base Monster X including: Monster Xs (Seats 8 instead of 5), Monster Y (Jeep Variant), and Monster Meg (Includes a transformation option into a boat). The Tesla Monster X has the interior of the future, with 17" touchscreen, yoke steering, and a 960-watt audio system.

      Below are some of the specifications:
      Engine: Electric Motor (670hp / 500kW)
      Transmission: 60D
      Battery: 100kwh
      Curb Weight: 5148lbs
      0-100km/h: 2.6s
      Cargo: 50L

      The Tesla Monster X is the future of all flying cars, with a luxurious interior and sleek exterior, allowing every to use.
      models: Monster X, Monster Xs, Monster Y, Monster Meg
      ###
      synopsis: ${synopsis}
      models: `,
      max_tokens: 30
    })
    document.getElementById('output-models').innerText = "Other Similar Models Include: " + response.data.choices[0].text.trim()
  }

  async function fetchImagePrompt(title, synopsis){
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Give a short description of an image which could be used to advertise a car based on a car model and an auto show description. The descirption should be rich in visual detail and mainly based on the first sentence of the description. The decription should be very specific in relation to the build of the car and contain no names.
      ###
      title: Tesla Monster X
      synopsis: The Tesla Monster X is a flying SUV with monster wheels and the largest legal flying car wings for maximum comfort. There are additional models which are variations of the base Monster X including: Monster Xs (Seats 8 instead of 5), Monster Y (Jeep Variant), and Monster Meg (Includes a transformation option into a boat). The Tesla Monster X has the interior of the future, with 17" touchscreen, yoke steering, and a 960-watt audio system.

      Below are some of the specifications:
      Engine: Electric Motor (670hp / 500kW)
      Transmission: 60D
      Battery: 100kwh
      Curb Weight: 5148lbs
      0-100km/h: 2.6s
      Cargo: 50L

      The Tesla Monster X is the future of all flying cars, with a luxurious interior and sleek exterior, allowing every to use.
      image description: A Tesla SUV driving on a road in the mountain ranges of Alaska with the car wings folded and giant monster truck wheels. The background is faded with the car being clearly visible.
      ###
      title: Porsche Cayenne6er
      synopsis: The Porsche 6-wheeler is the perfect combination of luxury and performance. It has a powerful V10 engine and 6-wheel drivetrain for maximum control and stability. The exterior design of this car is sleek and modern, with a unique 6-wheel setup and a striking front grille. The interior is packed with luxury features, such as a 12.3" touchscreen, Bose sound system, and adjustable leather seats.

      Below are some of the specifications:
      Engine: V10 (600hp / 450kW)
      Transmission: 8-speed PDK
      Curb Weight: 4200 lbs
      0-100km/h: 3.5s
      Cargo: 40L
      
      The Porsche 6-wheeler is a true luxury car with the power and performance of a sports car. Experience the best of both worlds with this unique car.
      image description: A porsche Cayenne SUV with 6 wheels driving in the dessert off-road where the 6 wheels are clearly shown. The background is faded with the car being clearly visible.
      ###
      title: ${title}
      synopsis: ${synopsis}
      image description: 
      `,
      temperature: 0.8,
      max_tokens: 100
    })
    fetchImageUrl(response.data.choices[0].text.trim())
  }

  async function fetchImageUrl(imagePrompt){
    const response = await openai.createImage({
      prompt: `${imagePrompt}. There should be no text in this image.`,
      n: 1,
      size: '256x256',
      response_format: 'b64_json' 
    })
    document.getElementById('output-img-container').innerHTML = `<img src="data:image/png;base64,${response.data.data[0].b64_json}">`
    setupInputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Car</button>`
    document.getElementById('view-pitch-btn').addEventListener('click', ()=>{
      document.getElementById('setup-container').style.display = 'none'
      document.getElementById('output-container').style.display = 'flex'
      elonText.innerText = `Wow! This idea is better than my idea of renaming "Twitter" to "X"! This will surely make you rich! Remember I'm getting 20% 💰`
    })
  }