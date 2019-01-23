var brushName;
var brushAliases;

var SyntaxHighlighter = function() { 

	var sh = {
			brushes : {},
	
			readBrushes : function () {
				//Find all brushes
				for (var brush in SyntaxHighlighter.brushes) 
				{
					brushAliases = SyntaxHighlighter.brushes[brush].aliases;
					brushName = "" + brush;
				}
			}
	
	}
	
	sh.Highlighter = function()
	{
	};
	
	return sh;
}();
