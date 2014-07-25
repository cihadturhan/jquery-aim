jquery.aim
==========

jQuery plugin which guesses which element user is going to be hovered/clicked.

##Examples
Examples can be found the [project page](http://cihadturhan.github.io/jquery-aim/examples/index.html)

##Usage
Call the function on the elements to catch user aim and add a class which will be added or removed when aiming starts or ends
```javascript
$('#target').aim({
    className: 'open'
});
```

If you want to execute a function on aim starts or ends, use the `aimEnter` and `aimExit` options
```javascript
$('#hamburger').aim({

    aimEnter: function() {
        $('#menu').show();
    }, 
    
    aimExit: function(){
        $('#menu').hide();
    }
});

```
