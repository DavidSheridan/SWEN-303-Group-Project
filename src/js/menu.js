function make_menu_button(menu, filename) {
	d3.select("#menu")
		.append('button')
		.attr('type', 'button')
		.style('background-color', '#00aeef')
		.style('width', '25%')
		.style('border-radius', '10')
		.style('border-color', '#000')
		.classed('btn btn-primary btn-lg', true)
		.text(menu)
		.on('click', function() {
			window.location.href = filename;
		});
}