const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to MedSync. What is your first and last name?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const askFirstLastName_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'askFirstLastName' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = '';
        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots); 
       
        //   SLOT: firstName 
        if (slotValues.firstName.heardAs && slotValues.lastName.heardAs) {
            slotStatus += 'Hello ' + slotValues.firstName.heardAs + ' ' + slotValues.lastName.heardAs + '. ';
        } else {
            slotStatus += 'Please enter/say a valid first and last name.';
        }
        if (slotValues.firstName.ERstatus === 'ER_SUCCESS_MATCH' & slotValues.lastName.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'You are a registered user. Please input your blood glucose value (add the correct unit to your response)';
        }
        if (slotValues.firstName.ERstatus === 'ER_SUCCESS_NO_MATCH' | slotValues.lastName.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += ' You are not a registered user. Please register.';
        }
        
        say += slotStatus;

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const askBloodGlucose_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'askBloodGlucose' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = '';
        
        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots); 
        
        //   SLOT: glucoseVal 
        if (slotValues.glucoseVal.heardAs) {
            slotStatus += '';
        } else {
            slotStatus += 'Please enter/say both a glucose value and unit. ';
            say += slotStatus;
            return responseBuilder
                .speak(say)
                .reprompt('try again, ' + say)
                .getResponse();
        }
        
        //   SLOT: glucoseUnit 
        if (slotValues.glucoseUnit.heardAs) {
            slotStatus += '';
        } else {
            slotStatus += 'Please enter/say both a glucose value and unit.';
            say += slotStatus;
            return responseBuilder
                .speak(say)
                .reprompt('try again, ' + say)
                .getResponse();
        }
        if (slotValues.glucoseUnit.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'Thank you for recording your blood glucose value of ' + slotValues.glucoseVal.heardAs + ' ' + slotValues.glucoseUnit.heardAs + '. This value will be uploaded to the MedSync database.';
            
            if (slotValues.glucoseVal.heardAs > 140){
                slotStatus += ' Please be advised that your blood glucose falls above the healthy range. Excercise at a park is recommended. Your closest options are Lindsey Street Park, Boone Park West, and Vine City Park.';
                
            } else if (slotValues.glucoseVal.heardAs < 70){
                slotStatus += ' Please be advised that your blood glucose falls below the healthy range. Going to a restaurant is recommended. Your closest options are Chick-fil-A, Panera, and McDonalds.';
            } else {
                slotStatus += ' Your blood sugar is healthy so there is nothing to worry about!'
                
            }
            slotStatus += ' Thank you for using MedSync!';
            
            
            var http = require("https");

            var options = {
              "method": "POST",
              "hostname": "hackmit2021-backend.azurewebsites.net",
              "port": 443,
              "path": "/glucose/1/" + slotValues.glucoseVal.heardAs,
            };
            
            var req = http.request(options, function (res) {
              var chunks = [];
            
              res.on("data", function (chunk) {
                chunks.push(chunk);
              });
            
              res.on("end", function () {
                var body = Buffer.concat(chunks);
                console.log(body.toString());
              });
            });
            
            req.end();
            
        }
        if (slotValues.glucoseUnit.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'is invalid. ';
            console.log('***** consider adding "' + slotValues.glucoseUnit.heardAs + '" to the custom slot type used by slot glucoseUnit! '); 
        }

        if( (slotValues.glucoseUnit.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.glucoseUnit.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('askBloodGlucose','glucoseUnit'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `MedSync is the best!`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        askFirstLastName_Handler,
        askBloodGlucose_Handler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();
    
/** Functions **/
function getSlotValues(filledSlots) { 
    const slotValues = {}; 
 
    Object.keys(filledSlots).forEach((item) => { 
        const name  = filledSlots[item].name; 
 
        if (filledSlots[item] && 
            filledSlots[item].resolutions && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0] && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) { 
            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) { 
                case 'ER_SUCCESS_MATCH': 
                    slotValues[name] = { 
                        heardAs: filledSlots[item].value, 
                        resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name, 
                        ERstatus: 'ER_SUCCESS_MATCH' 
                    }; 
                    break; 
                case 'ER_SUCCESS_NO_MATCH': 
                    slotValues[name] = { 
                        heardAs: filledSlots[item].value, 
                        resolved: '', 
                        ERstatus: 'ER_SUCCESS_NO_MATCH' 
                    }; 
                    break; 
                default: 
                    break; 
            } 
        } else { 
            slotValues[name] = { 
                heardAs: filledSlots[item].value, 
                resolved: '', 
                ERstatus: '' 
            }; 
        } 
    }, this); 
 
    return slotValues; 
} 
 
function getExampleSlotValues(intentName, slotName) { 
 
    let examples = []; 
    let slotType = ''; 
    let slotValuesFull = []; 
 
    let intents = model.interactionModel.languageModel.intents; 
    for (let i = 0; i < intents.length; i++) { 
        if (intents[i].name === intentName) { 
            let slots = intents[i].slots; 
            for (let j = 0; j < slots.length; j++) { 
                if (slots[j].name === slotName) { 
                    slotType = slots[j].type; 
 
                } 
            } 
        } 
         
    } 
    let types = model.interactionModel.languageModel.types; 
    for (let i = 0; i < types.length; i++) { 
        if (types[i].name === slotType) { 
            slotValuesFull = types[i].values; 
        } 
    } 
 
 
    examples.push(slotValuesFull[0].name.value); 
    examples.push(slotValuesFull[1].name.value); 
    if (slotValuesFull.length > 2) { 
        examples.push(slotValuesFull[2].name.value); 
    } 
 
 
    return examples; 
} 
 
function sayArray(myData, penultimateWord = 'and') { 
    let result = ''; 
 
    myData.forEach(function(element, index, arr) { 
 
        if (index === 0) { 
            result = element; 
        } else if (index === myData.length - 1) { 
            result += ` ${penultimateWord} ${element}`; 
        } else { 
            result += `, ${element}`; 
        } 
    }); 
    return result; 
} 

const model = {
  "interactionModel": {
    "languageModel": {
      "invocationName": "med sync",
      "intents": [
        {
          "name": "AMAZON.CancelIntent",
          "samples": []
        },
        {
          "name": "AMAZON.HelpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.StopIntent",
          "samples": []
        },
        {
          "name": "HelloWorldIntent",
          "slots": [],
          "samples": [
            "hello",
            "how are you",
            "say hi world",
            "say hi",
            "hi",
            "say hello world",
            "say hello"
          ]
        },
        {
          "name": "AMAZON.NavigateHomeIntent",
          "samples": []
        },
        {
          "name": "AMAZON.FallbackIntent",
          "samples": []
        },
        {
          "name": "askFirstLastName",
          "slots": [
            {
              "name": "firstName",
              "type": "FIRSTNAME"
            },
            {
              "name": "lastName",
              "type": "LASTNAME"
            }
          ],
          "samples": [
            "My first name is {firstName} and my last name is {lastName}",
            "Name is {firstName} {lastName}",
            "My name is {firstName} {lastName}"
          ]
        },
        {
          "name": "askBloodGlucose",
          "slots": [
            {
              "name": "glucoseVal",
              "type": "AMAZON.NUMBER"
            },
            {
              "name": "glucoseUnit",
              "type": "glucoseLevelUnit"
            }
          ],
          "samples": [
            "My glucose level is {glucoseVal} {glucoseUnit}",
            "{glucoseVal} {glucoseUnit}",
            "My blood glucose is {glucoseVal} {glucoseUnit}"
          ]
        },
        {
          "name": "LaunchRequest"
        }
      ],
      "types": [
        {
          "name": "FIRSTNAME",
          "values": [
            {
              "name": {
                "value": "cody"
              }
            },
            {
              "name": {
                "value": "richie"
              }
            },
            {
              "name": {
                "value": "jim"
              }
            },
            {
              "name": {
                "value": "billy"
              }
            },
            {
              "name": {
                "value": "vince"
              }
            },
            {
              "name": {
                "value": "tommy"
              }
            },
            {
              "name": {
                "value": "bobby"
              }
            },
            {
              "name": {
                "value": "gary"
              }
            },
            {
              "name": {
                "value": "kenny"
              }
            },
            {
              "name": {
                "value": "doug"
              }
            },
            {
              "name": {
                "value": "stacey"
              }
            },
            {
              "name": {
                "value": "andy"
              }
            },
            {
              "name": {
                "value": "charlie"
              }
            },
            {
              "name": {
                "value": "jimmy"
              }
            },
            {
              "name": {
                "value": "joey"
              }
            },
            {
              "name": {
                "value": "katie"
              }
            },
            {
              "name": {
                "value": "ricky"
              }
            },
            {
              "name": {
                "value": "dave"
              }
            },
            {
              "name": {
                "value": "steve"
              }
            },
            {
              "name": {
                "value": "danny"
              }
            },
            {
              "name": {
                "value": "brian"
              }
            },
            {
              "name": {
                "value": "mike"
              }
            },
            {
              "name": {
                "value": "chris"
              }
            },
            {
              "name": {
                "value": "nick"
              }
            },
            {
              "name": {
                "value": "justin"
              }
            },
            {
              "name": {
                "value": "lauren"
              }
            },
            {
              "name": {
                "value": "robbie"
              }
            },
            {
              "name": {
                "value": "brett"
              }
            },
            {
              "name": {
                "value": "greg"
              }
            },
            {
              "name": {
                "value": "akhilesh"
              }
            },
            {
              "name": {
                "value": "shaun"
              }
            },
            {
              "name": {
                "value": "jeremy"
              }
            },
            {
              "name": {
                "value": "Nicholas"
              }
            },
            {
              "name": {
                "value": "derek"
              }
            },
            {
              "name": {
                "value": "darren"
              }
            },
            {
              "name": {
                "value": "brendan"
              }
            },
            {
              "name": {
                "value": "liam"
              }
            },
            {
              "name": {
                "value": "kevin"
              }
            },
            {
              "name": {
                "value": "sean"
              }
            },
            {
              "name": {
                "value": "jason"
              }
            },
            {
              "name": {
                "value": "jamie"
              }
            },
            {
              "name": {
                "value": "brad"
              }
            },
            {
              "name": {
                "value": "shane"
              }
            },
            {
              "name": {
                "value": "kyle"
              }
            },
            {
              "name": {
                "value": "ryan"
              }
            },
            {
              "name": {
                "value": "matt"
              }
            },
            {
              "name": {
                "value": "jake"
              }
            },
            {
              "name": {
                "value": "zach"
              }
            },
            {
              "name": {
                "value": "josh"
              }
            },
            {
              "name": {
                "value": "Max"
              }
            },
            {
              "name": {
                "value": "Gabe"
              }
            },
            {
              "name": {
                "value": "Avik"
              }
            },
            {
              "name": {
                "value": "Rohan"
              }
            }
          ]
        },
        {
          "name": "LASTNAME",
          "values": [
            {
              "name": {
                "value": "turner"
              }
            },
            {
              "name": {
                "value": "evans"
              }
            },
            {
              "name": {
                "value": "parker"
              }
            },
            {
              "name": {
                "value": "cruz"
              }
            },
            {
              "name": {
                "value": "diaz"
              }
            },
            {
              "name": {
                "value": "nguyen"
              }
            },
            {
              "name": {
                "value": "hill"
              }
            },
            {
              "name": {
                "value": "flores"
              }
            },
            {
              "name": {
                "value": "rivera"
              }
            },
            {
              "name": {
                "value": "hall"
              }
            },
            {
              "name": {
                "value": "baker"
              }
            },
            {
              "name": {
                "value": "green"
              }
            },
            {
              "name": {
                "value": "king"
              }
            },
            {
              "name": {
                "value": "allen"
              }
            },
            {
              "name": {
                "value": "young"
              }
            },
            {
              "name": {
                "value": "walker"
              }
            },
            {
              "name": {
                "value": "robinson"
              }
            },
            {
              "name": {
                "value": "lewis"
              }
            },
            {
              "name": {
                "value": "ramirez"
              }
            },
            {
              "name": {
                "value": "clark"
              }
            },
            {
              "name": {
                "value": "sanchez"
              }
            },
            {
              "name": {
                "value": "harris"
              }
            },
            {
              "name": {
                "value": "white"
              }
            },
            {
              "name": {
                "value": "thompson"
              }
            },
            {
              "name": {
                "value": "perez"
              }
            },
            {
              "name": {
                "value": "lee"
              }
            },
            {
              "name": {
                "value": "martin"
              }
            },
            {
              "name": {
                "value": "jackson"
              }
            },
            {
              "name": {
                "value": "moore"
              }
            },
            {
              "name": {
                "value": "taylor"
              }
            },
            {
              "name": {
                "value": "thomas"
              }
            },
            {
              "name": {
                "value": "anderson"
              }
            },
            {
              "name": {
                "value": "wilson"
              }
            },
            {
              "name": {
                "value": "sharma"
              }
            },
            {
              "name": {
                "value": "gonzales"
              }
            },
            {
              "name": {
                "value": "lopez"
              }
            },
            {
              "name": {
                "value": "hernandez"
              }
            },
            {
              "name": {
                "value": "martinez"
              }
            },
            {
              "name": {
                "value": "rodriguez"
              }
            },
            {
              "name": {
                "value": "davis"
              }
            },
            {
              "name": {
                "value": "miller"
              }
            },
            {
              "name": {
                "value": "garcia"
              }
            },
            {
              "name": {
                "value": "jones"
              }
            },
            {
              "name": {
                "value": "brown"
              }
            },
            {
              "name": {
                "value": "williams"
              }
            },
            {
              "name": {
                "value": "johnson"
              }
            },
            {
              "name": {
                "value": "smith"
              }
            },
            {
              "name": {
                "value": "sarkar"
              }
            },
            {
              "name": {
                "value": "mishra"
              }
            },
            {
              "name": {
                "value": "sinha"
              }
            },
            {
              "name": {
                "value": "kumar"
              }
            },
            {
              "name": {
                "value": "Richards"
              }
            },
            {
              "name": {
                "value": "Bengkins"
              }
            },
            {
              "name": {
                "value": "ghosh"
              }
            },
            {
              "name": {
                "value": "chatterjee"
              }
            },
            {
              "name": {
                "value": "mukherjee"
              }
            },
            {
              "name": {
                "value": "Banerjee"
              }
            }
          ]
        },
        {
          "name": "glucoseLevelUnit",
          "values": [
            {
              "name": {
                "value": " milligrams per decilitre"
              }
            },
            {
              "name": {
                "value": "millimole per liter"
              }
            }
          ]
        }
      ]
    }
  }
};