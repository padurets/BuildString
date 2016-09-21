# StringBuilder

### Example

``` js

function asyncFunction(callback) {
    setTiomout(function(){
        var x = 'async '
        callback(x) // to continue build
    }, 2000);
}


var parameters = [
    'simple string ',
    asyncFunction,
    {
        value: 'hello world',
        test: /world/
    }
]


var string = new StringBuilder(parameters, isvalid);

string.build(function(generatedString){
    // generatedString = "simple string async hello world",
    // isvalid = true
});

```