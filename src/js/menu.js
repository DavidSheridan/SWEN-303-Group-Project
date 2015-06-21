function make_menu_button(menu, filename) {
	d3.select("#menu")
		.append('button')
		.attr('type', 'button')
		.style('width', '25%')
		.style('border-radius', '0')
		.classed('btn btn-primary btn-lg', true)
		.text(menu)
		.on('click', function() {
			window.location.href = filename;
		});
}