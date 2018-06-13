export class TestManager{
	constructor(testName){
		this.testName = testName;
		this.testCount = 0;
	}

	beforeTestDo(){}

	afterTestDo(){}

	assert(expectedValue, testFunc, message){

		let actualValue = testFunc()

		if(expectedValue !== actualValue){
			this.messageFailed(++this.testCount, message, expectedValue, actualValue);
		}
		else
		{
			this.messagePassed(++this.testCount, message, expectedValue, actualValue);
		}
	}

	flushTests(){
		this.testList.splice(0, this.testList.length);
	}

	messageFailed(testNumber, message, expectedValue, actualValue){
		console.error("Failed test #" + testNumber + " in " + this.testName + ": " + message + 
			"\nExpected " + expectedValue + ", got " + actualValue);
	}

	messagePassed(testNumber, message, expectedValue, actualValue){
		console.log("Passed test #" + testNumber + " in " + this.testName + ": " + message + 
			"\nExpected " + expectedValue + ", got " + actualValue);
	}
}