import { constantCode, defaultMessage, statusCodeConstants, defaultCode, logger } from '@utils'
import { addressFields, customerFields, contactFields } from '@utils/constant'
import { config } from '@config/env.config'
import { compareRecords, transformRecord } from '@resources'
import { Op } from 'sequelize'
import { RowInput, Normalizer } from '@utils/normalizer';
const fs = require('fs');
const aposToLexForm = require('apos-to-lex-form');
const SW = require('stopword');
const { WordTokenizer, SentimentAnalyzer, PorterStemmer, BayesClassifier, CountInflector, LancasterStemmer, TfIdf, HammingDistance } = require('natural');
const { Neuron, Layer, Network, Trainer, Architect, Modal } = require('synaptic')
const SpellCorrector = require('spelling-corrector');
const Papa = require('papaparse');

const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();

let instance, trainer, network
export default class AIService {
  constructor(){
      if (!instance) {
          instance = this
        }
        return instance
  }

  async trainModel(trainingDataSet, userId, conn){
    // console.log('trainingDataSet==>', trainingDataSet.dataSet)
    // Sample data set 1
      
    //Interest =1, Appeals =0, Purchase =1, Grievance =0, General=1, Feedback=1, Recommendation=1, Suggestion=1, Request=1
    //Service related =1, payment related =1, bill related = 1, Support Related =1, Account Related =1, PRODUCT_RELATED=1, OFFERS_RELATED=1
        
    // const sampleTrainingDataSet = {
    //   dataSet: [
    //     { "input": [1, 1], "output": [1] },
    //     { "input": [0, 1], "output": [0] },       
    //     { "input": [0, 0], "output": [0] },
    //     { "input": [1, 0], "output": [1] }      
    //   ]};
    const sampleTrainingDataSet ={dataSet:[
      { input: 'I feel great about the world!', output: 'happy' },
      { input: 'The world is a terrible place!', output: 'sad' },
    ]}
      /*
      const Papa = require('papaparse');
      const synaptic = require('synaptic');

      // Load the data
      let rawData = [];
      let labels = [];
      Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function(results) {
          rawData = results.data.map(row => [row.age, row.income, row.gender, row.occupation]);
          labels = results.data.map(row => row.smoker);
        }
      });     

      // Preprocess the data
      let input = [];
      let output = [];
      rawData.forEach((row, index) => {
        // One-hot encode categorical variables
        const gender = row[2] === 'Male' ? [1, 0] : [0, 1];
        const occupation = row[3] === 'Engineer' ? [1, 0, 0] : row[3] === 'Manager' ? [0, 1, 0] : [0, 0, 1];
        input.push([...row.slice(0, 2), ...gender, ...occupation]);
        output.push(labels[index] === 'Yes' ? [1] : [0]);
      });

      // Define the network
      const inputLayer = new synaptic.Layer(6);
      const hiddenLayer = new synaptic.Layer(4);
      const outputLayer = new synaptic.Layer(1);
      inputLayer.project(hiddenLayer);
      hiddenLayer.project(outputLayer);
      const network = new synaptic.Network({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
      });

      // Train the network
      const trainer = new synaptic.Trainer(network);
      trainer.train(input, output, {
        rate: 0.1,
        iterations: 1000,
        error: 0.1,
        shuffle: true,
        log: 1
      });

      // Evaluate the network
      const validationInput = input.slice(0, input.length / 5);
      const validationOutput = output.slice(0, output.length / 5);
      const validationData = validationInput.map((input, index) => [input, validationOutput[index]]);
      const validationResult = trainer.test(validationData);
      console.log("Accuracy:", validationResult.error);
       */    
  
      network = new Architect.Recurrent(sampleTrainingDataSet.dataSet[0].input.length, 3, sampleTrainingDataSet.dataSet[0].output.length);

      var learningRate = .3;
      // for (var i = 0; i < 20000; i++)
      // {
      //   for(const ds of sampleTrainingDataSet.dataSet){
      //     network.activate(ds.input);
      //     network.propagate(learningRate, ds.output);
      //   }  
      // }
    trainer = new Trainer(network);

    const trainingOutput= trainer.train(sampleTrainingDataSet.dataSet, { rate: learningRate, iterations: 20000, log: 1000 });
    const exported = network.toJSON();
      
     fs.writeFile("model1.json", JSON.stringify(exported), (err) => {
      if (err)
        console.log(err);
      else {
        console.log("File written successfully\n");
        console.log("The written has the following contents:");
        //console.log(fs.readFileSync("model1.json", "utf8"));
      }
    });
      // Example 1
      /*
        var myPerceptron = new LSTM(2,3,1);
        var myTrainer = new Trainer(myPerceptron);

        myTrainer.XOR({iterations: 2000}); //{ error: 0.004998819355993572, iterations: 21871, time: 356 }

        //  myPerceptron.activate([0,0]); // 0.0268581547421616
        //  myPerceptron.activate([1,0]); // 0.9829673642853368
        //  myPerceptron.activate([0,1]); // 0.9831714267395621
        //  myPerceptron.activate([1,1]); // 0.02128894618097928
    
        const data=[myPerceptron.activate([0,0]), myPerceptron.activate([1,0]), myPerceptron.activate([0,1]), myPerceptron.activate([1,1])]
      */
        
      // Example 2
      /*
      var myNet = new Architect.Perceptron(10, 7, 1);
      var trainer = new Trainer(myNet)
      var trainingSet = [
          {
            input: [0,0,1,0.12,0,0,0,0,1,1],
            output: [1]
          },
          {
            input:  [0,1,0,0.045,0,0,1,1,0,0],
            output: [0]
          },
          {
            input:  [1,0,0,0.42,1,1,0,0,0,0],
            output: [1]
          }
        ]
        
        var trainingOptions = {
          rate: .1,
          iterations: 20000,
          error: .005,
        }
        
      const trainingOutput= trainer.train(trainingSet, trainingOptions);
      */
      return{
        status: statusCodeConstants.SUCCESS,
        data: trainingOutput,
        message: "Success"
      }
    }
  async reTrainByThisUserData() {
    // retrain the model by this user's data
    if (localNetworkInstance) {
        localNetworkInstance.propagate(learningRate, this.trainingSet.output);   // propagate the network

        console.logger('Neural Network retrained!');       

        this.loading = true;
        axios.post('http://localhost:3000/api/ai-service/train-dataset', {
            body: localNetworkInstance.toJSON()
        })
            .then((response) => {
                this.loading = false;
                if (response.data && response.data.code === 200) {
                  console.log(response.data);
                } else {
                  console.log(response.data);
                }
            })
            .catch(function (error) {
                errorFunc(error)
            });
    } else {
        this.loading = false;
        console.log('network is undefined!');
    }
  }  
  async prediction(inputArrayObj, userId, conn){

    const predictionDataSet = { 
      input: inputArrayObj.input
    };
    let localNetworkInstance
    fs.readFile('model1.json', 'utf8', function(err, data){
      if (data && Object.keys(data).length > 0) {
        console.log('Received neural network from server.');
        localNetworkInstance = Network.fromJSON(JSON.parse(data));
      } else {
        console.log('Created a new network instance.');
          // create a new network instance
          const inputLayer = new Layer(5);
          const hiddenLayer = new Layer(10);
          const outputLayer = new Layer(1);

          inputLayer.project(hiddenLayer);
          hiddenLayer.project(outputLayer);

          localNetworkInstance = new Network({
              input: inputLayer,
              hidden: [hiddenLayer],
              output: outputLayer
          });
      }
      const standalone = localNetworkInstance.standalone()
      predictionDataSet.output = standalone(predictionDataSet.input)
      console.log('predictionDataSet==>', predictionDataSet);  
    });    
    
    return{
      status: statusCodeConstants.SUCCESS,
      data: predictionDataSet,
      message: "Success"
    }
   }

  async normalizeOutput(inputArrayObj, outputArrayObj){
      //sample input data
      /*
    const sampleData =[{ "soilhumidity": 500, "airtemp": 32, "airhum": 18, "water": true, "plants": ["tomatoes", "potatoes"] },
    { "soilhumidity": 1050, "airtemp": 40, "airhum": 21, "water": true, "plants": ["potatoes", "asparagus"] },
    { "soilhumidity": 300, "airtemp": 100, "airhum": 90, "water": false, "plants": ["asparagus", "tomatoes"] },
    { "soilhumidity": 950, "airtemp": 103, "airhum": 26, "water": true, "plants": ["asparagus", "asparagus"] },
    { "soilhumidity": 1050, "airtemp": 8, "airhum": 26, "water": true, "plants": ["tomatoes", "tomatoes"] },
    { "soilhumidity": 1050, "airtemp": 56, "airhum": 26, "water": true, "plants": ["potatoes", "french fries"] }]
    */
    const normalizer = new Normalizer(inputArrayObj);

    // setting required options and normalize the data    
    normalizer.setOutputProperties(outputArrayObj);
    normalizer.normalize();

    // find useful information about your data
    // to pass to your neural network
    const nbrInputs = normalizer.getInputLength();
    const nbrOutputs = normalizer.getOutputLength();

    const metadata = normalizer.getDatasetMetaData();
    const inputs = normalizer.getBinaryInputDataset();
    const outputs = normalizer.getBinaryOutputDataset();

    console.log(metadata);
    console.log(inputs);
    console.log(outputs);
       return{
            status: statusCodeConstants.SUCCESS,
            data: ""
        }
    }  

    /****This method is to analyse the text blocks and provide weightage******/
  async wordAnalysis(inputArrObj, comparisonTextArrObj) {
    let tfidf = new TfIdf()
    
    //Sample 1
    /*
    tfidf.addDocument(['complaint'])
    tfidf.addDocument(['inquiry'])
    tfidf.addDocument(['complaint', 'complaint', 'complaint'])
    tfidf.addDocument(['complaint', 'inquiry', 'inquiry'])
    */

    //Sample 2
    /*
    tfidf.addDocument('I want a new prepaid connection')
    tfidf.addDocument('Need new gas connection')
    tfidf.addDocument('Internet not working')
    tfidf.addDocument('My service usage is high')
    */
    // tfidf.tfidfs(keywords, function (i, measure) {
    //   console.log(measure)
    // })      
    //console.log(tfidf.tfidf('new', 0))
    //console.log(tfidf.tfidf('new', 1))
    
    let weightageOfWords

    tfidf.tfidfs(comparisonTextArrObj, function (i, measure) {
      weightageOfWords =measure
    }) 

    let inputArrayObj = Array.isArray(inputArrObj) ? inputArrObj: [inputArrObj]

    let graph = Tokenizer(inputArrayObj.join(' '))
    
    tfidf.addDocument(inputArrayObj.join(' '))

    let tfGraph = graph.map(item =>
      _.merge({
        score: tfidf.tfidf(item, 0)
      }, item)
    )
    tfGraph = _.filter(tfGraph, item => item !== '')
    
    const returnObj={
      weightageOfWords,
      totalWords: inputArrayObj.split(' ').length,
      relevance: tfGraph
    }
    return {
      data: returnObj,      
      status: statusCodeConstants.SUCCESS
    }
  }

/****This method is to classify the text blocks and provide possible category using Naive Bayes and logistic regression.******/
  async textClassification(){      
      
      const classifier = new BayesClassifier();

      classifier.addDocument('my unit-tests failed.', 'software')
      classifier.addDocument('tried the program, but it was buggy.', 'software')
      classifier.addDocument('the drive has a 2TB capacity.', 'hardware')
      classifier.addDocument('i need a new power supply.', 'hardware')

      classifier.train()

      console.log(classifier.classify('did the tests pass?'))
      console.log(classifier.classify('did you buy a new drive?'))       
      
        /****To load classifier as json file use below method******/
      natural.BayesClassifier.load('classifier.json', null, function (err, classifier) {
        if (err) {
          console.log(err)
          return
        }
        console.log(classifier.classify('did the tests pass?'))
      })

      /****To save classifier as json file use below method******/

      classifier.save('classifier.json', function (err, classifier) {
        if (err) {
          console.log(err)
        }
      })

        
  }
  /***Analyse the Sentiment by using afinn vocabolary and PorterStemmer Menthod. Other methods are senticon and pattern ***/
  async sentimentAnalysis(inputData, userId, conn){
    const lexedReview = aposToLexForm(inputData.inputText);
    const casedReview = lexedReview.toLowerCase();
    const alphaOnlyReview = casedReview.replace(/[^a-zA-Z\s]+/g, '');
    const tokenizedReview = TokenizeAndStem(alphaOnlyReview);
    console.log("tokenizedReview==>", tokenizedReview)
    
    tokenizedReview.forEach((word, index) => {
      tokenizedReview[index] = spellCorrector.correct(word);
    })

    const filteredReview = SW.removeStopwords(tokenizedReview);
    console.log("filteredReview==>", filteredReview)
    const analyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");
    const result = analyzer.getSentiment(filteredReview);

    console.log(result);        
    
    return{
        status: statusCodeConstants.SUCCESS,
        data: result
    }
  }

  async textPrediction(){
    // Create dictionary as our source of knowledge
    const dictionary = ['cat', 'bob', 'ice'];
  
    // Define binary size for one letter
    const binarySize = 7;
    
    // Define number of neurons in our network. It's word length multiplied by binarySize
    const neuronsCount = 21;

    // Create Hopfield Neural Network
    const hopfieldNetwork = new Architect.Hopfield(neuronsCount);

    // Create dictionary of binary words
    const binaryDicitonary = dictionary.map(word => wordToBinary(word));
    
    // Learn our network new patterns
    hopfieldNetwork.learn(binaryDicitonary);
    
    // Let's check if it works
    console.log(binaryToWord(hopfieldNetwork.feed(wordToBinary('dog')),binarySize));
  }
}

// Transform word to binary string
function strToBinary(s)
{
    let n = s.length;
    let binary=''
        for (let i = 0; i < n; i++)
        {
            // convert each char to
            // ASCII value
            let val = (s[i]).charCodeAt(0);
               
            // Convert ASCII value to binary
            let bin = "";
            while (val > 0)
            {
                if (val % 2 == 1)
                {
                    bin += '1';
                }
                else
                    bin += '0';
                val = Math.floor(val/2);
            }
            bin = reverse(bin);
   
            binary+=bin + " ";
        }
        return binary
}
 
function reverse(input)
{
    const a = input.split("");
        let l, r = 0;
        r = a.length - 1;
   
        for (l = 0; l < r; l++, r--)
        {
            // Swap values of l and r
            let temp = a[l];
            a[l] = a[r];
            a[r] = temp;
        }
        return (a).join("");
}
// Transform word to binary string
function wordToBinary (word) {
  let binaryWord = '';

  for (let i = 0; i < word.length; i++) {    
  binaryWord += word.charCodeAt(i).toString(2);
  }

  return binaryWord.trim();
};

// Transform binary string to word
function binaryToWord(binaryWord, binarySize) {
  const wordLength = binaryWord.length / binarySize;
  let word = '';

  for (let i = 0; i < wordLength; i++) {
  word += String.fromCharCode(parseInt(binaryWord.slice(i * binarySize, i * binarySize + binarySize).join(''), 2));
  }

  return word;
};

/*
function Perceptron(input, hidden, output)
{
	// create the layers
	var inputLayer = new Layer(input);
	var hiddenLayer = new Layer(hidden);
	var outputLayer = new Layer(output);

	// connect the layers
	inputLayer.project(hiddenLayer);
	hiddenLayer.project(outputLayer);

	// set the layers
	this.set({
		input: inputLayer,
		hidden: [hiddenLayer],
		output: outputLayer
	});
}

// extend the prototype chain
Perceptron.prototype = new Network();
Perceptron.prototype.constructor = Perceptron;

function LSTM(input, blocks, output)
{
	// create the layers
	var inputLayer = new Layer(input);
	var inputGate = new Layer(blocks);
	var forgetGate = new Layer(blocks);
	var memoryCell = new Layer(blocks);
	var outputGate = new Layer(blocks);
	var outputLayer = new Layer(output);

	// connections from input layer
	var input = inputLayer.project(memoryCell);
	inputLayer.project(inputGate);
	inputLayer.project(forgetGate);
	inputLayer.project(outputGate);

	// connections from memory cell
	var output = memoryCell.project(outputLayer);

	// self-connection
	var self = memoryCell.project(memoryCell);

	// peepholes
	memoryCell.project(inputGate);
	memoryCell.project(forgetGate);
	memoryCell.project(outputGate);

	// gates
	inputGate.gate(input, Layer.gateType.INPUT);
	forgetGate.gate(self, Layer.gateType.ONE_TO_ONE);
	outputGate.gate(output, Layer.gateType.OUTPUT);

	// input to output direct connection
	inputLayer.project(outputLayer);

	// set the layers of the neural network
	this.set({
		input: inputLayer,
		hidden: [inputGate, forgetGate, memoryCell, outputGate],
		output: outputLayer
	});
}

// extend the prototype chain
LSTM.prototype = new Network();
LSTM.prototype.constructor = LSTM;
*/

export function Tokenizer(input){
  var tokenizer = new WordTokenizer();
  return tokenizer.tokenize(input)
}

export function Stemming(input){
  return LancasterStemmer.stem(input)
}

export function TokenizeAndStem(input){
  return PorterStemmer.tokenizeAndStem(input)
}

  /****This method returns similar texts from text blocks******/
export function similarWords(input1, input2, ignoreCase=false){
  return HammingDistance(input1, input2, ignoreCase) 
}