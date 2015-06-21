function make_season_filter(){
	console.log('Made indicators');
	var filter = d3.select('#filters');

	var carousel = filter.append('div')
		.attr('id', 'season-filter')
		.attr('data-ride', 'carousel')
		.style('height', 80)
		.classed('carousel slide', true);

	var indicators = carousel.append('ol')
		.classed('carousel-indicators',true);

	var wrapers = carousel.append('div')
		.classed('carousel-inner',true)
		.attr('role', 'listbox');

	var season = wrapers.append('div')
		.classed('item active', true);

	season.append('img')
		.attr('src', 'http://www.anz-championship.com/portals/6/Images/Team%20Logos/200x150/thunderbirds.png')
		.style('width', 'auto')
		.style('height', '70')
	season.append('div')
		.classed('carousel-caption', true)
		.text('Test two');

	season = wrapers.append('div')
		.classed('item', true);

	season.append('img')
		.attr('src', 'http://www.anz-championship.com/portals/6/Images/Team%20Logos/200x150/pulse.png')
		.style('width', 'auto')
		.style('height', '70')
	season.append('div')
		.classed('carousel-caption', true)
		.text('Test One');


	var left_control = carousel.append('a')
		.classed('left carousel-control', true)
		.attr('href', '#season-filter')
		.attr('role', 'button')
		.attr('data-slide', 'prev')
		.on('click', function(){
			console.log('Prevous selection');
		});
	left_control.append('span')
		.classed('glyphicon glyphicon-chevron-left',true)
		.attr('aria-hidden', 'true');
	left_control.append('span')
		.classed('sr-only',true)
		.text('Previous');

	var right_control = carousel.append('a')
		.classed('right carousel-control', true)
		.attr('href', '#season-filter')
		.attr('role', 'button')
		.attr('data-slide', 'next')
		.on('click', function(){
			console.log('Next selection');
		});

	right_control.append('span')
		.classed('glyphicon glyphicon-chevron-right',true)
		.attr('aria-hidden', 'true');
	right_control.append('span')
		.classed('sr-only',true)
		.text('Next');
}