var Mts = {}
Mts.fixedHeader = {
	setHeader: function() {
		var menu = $('.main-menu-holder '),
			menuTop = $(window).scrollTop() - menu.offset().top;
		if (menuTop >= 0) {
			menu.addClass('fixed-menu');
		} else {
			menu.removeClass('fixed-menu');
		}
	},
	init: function() {
		var t = this;
		t.setHeader();
		$(document).on('scroll', function(){
			t.setHeader();
		});
	}
}

Mts.common = {
	'userId': 0
};

Mts.common.init = function() {
		var t = this;
		$(document).on('click', '.paragraph-toggler, .repairs-menu, .room-menu, .flat-plan, .new-checkbox', function(e){
			if (e.target.className == 'paragraph-toggler') {
				$(this).parent().parent().find('.paragraph-description').toggleClass('shown');
			};

			if (e.target.className == 'text') {
					var userInput = $(this),
							NewUserInput = userInput.clone().html();
					userInput.removeClass('new-checkbox');
					userInput.after('<div class="form-row new-checkbox">' + NewUserInput + '</div>');
			}

			var planingBlockHeight = $('.planing-block .repairs-tabs.active .repairs-tab.active').height();
			$('.planing-block').animate({
				height: planingBlockHeight
			});

		});

		// $(document).on('keyup', function(e){
		// 	if($(e.target).is('input.text')) {
		// 		alert(1);
		// 	}
		// });

		$('.hall').addClass('selected');
		setTimeout(function(){
			$('.room-menu [data-room="Прихожая"]').click();
		},10);
		setTimeout(function(){
			$('.repairs-menu [data-repair="Планирование"]').parent().click();
		},20);

		$('.print').on('click', function() {
			Mts.formsData.composeObject();
			if(! $.isEmptyObject(Mts.formsData.userData.userRooms)) {
				Mts.formsData.printObject();
				window.print();
			}
		});

		$('.share').on('click', function(e) {
			Mts.formsData.composeObject();

			if(! $.isEmptyObject(Mts.formsData.userData.userRooms)) {
				Mts.formsData.htmlObject();
				$('.mail-form-holder').addClass('active');
			} else {
				e.preventDefault();
			}
		})

		$('.close-form').on('click', function() {
			$('.mail-form-holder').removeClass('active');
			$('.error-mail, .success-mail').removeClass('.active');
		});

		$('.send-mail input').keyup(function() {
			var mail = $(this).val().length;
			if(mail > 7) {
				$('.send-mail button').removeClass('disabled');
			}
		});

		Mts.formsData.checkItUp();
	};

Mts.rooms = {
	/* this one for room click */
	choseRoom: function(elem) {
		var room = elem.attr('data-room'),
			roomTab = $('.room-menu li[data-room="' + room + '"]');

		roomTab.siblings().removeClass('active');
		roomTab.addClass('active');

		elem.siblings().removeClass('selected')
		elem.addClass('selected');

		Mts.rooms.roomTabsToggler(elem.attr('data-room'));
		$('.article').removeClass('visible');
		$('.article').removeClass('filtered');
		setTimeout(function(){
				Mts.articles.getArticles();
			}, 10)
		$('html, body').animate({
			scrollTop: $('.room-menu').offset().top - 59
		}, 1000);

		elem.find('.repairs-tab:first').addClass('active');
		$('.repairs-menu li').removeClass('active');
		$('.repairs-menu li:first').addClass('active');
	},

	/* this one for room menu click */
	choseMenuRoom: function(elem) {
		var room = elem.attr('data-room'),
			roomTab = $('.flat-plan .room[data-room="' + room + '"]'),
			roomPlan = $('.flat-plan .room[data-room="' + room + '"]');

		roomPlan.siblings().removeClass('selected');
		roomPlan.addClass('selected');
		elem.siblings().removeClass('active');
		elem.addClass('active');
		elem.find('.repairs-tab:first').addClass('active');
		$('.repairs-menu li').removeClass('active');
		$('.repairs-menu li:first').addClass('active');

		Mts.rooms.roomTabsToggler(elem.attr('data-room'));
		setTimeout(function(){
				Mts.articles.getArticles();
		}, 10)
	},

	roomTabsToggler: function(elem) {
		var roomToShow = $('.room-tabs .room[data-room="' + elem + '"]'),
		roomToRepair = $('.planing-block .repairs-tabs[data-room="' + elem + '"]');

		roomToShow.siblings().removeClass('active');
		$('.repairs-tab').removeClass('active');
		roomToShow.addClass('active');

		/* setting the repair types list */
		$('.repairs-menu').attr('data-room', elem);

		roomToRepair.siblings().removeClass('active');
		roomToRepair.addClass('active');
		roomToRepair.find('.repairs-tab:first').addClass('active');
		$('.repairs-menu li').removeClass('active');
		$('.repairs-menu li:first').addClass('active');
	},

	repairsTabsTogler: function(elem) {
		var tabToShow = elem.find('a').attr('data-repair'),
			repairTypeToShow = $('.repairs-tabs.active .repairs-tab[data-repair="' + tabToShow + '"]');

			elem.siblings().removeClass('active');
			elem.addClass('active');

			repairTypeToShow.siblings().removeClass('active');
			repairTypeToShow.addClass('active');
	},

	init: function() {
		var t = this;

		$('.room').on('click', function(){
			t.choseRoom($(this));
		});

		$('.room-menu li').on('click', function(e){
			e.preventDefault();
			t.choseMenuRoom($(this));
		});

		$('.repairs-menu li').on('click', function(e) {
			e.preventDefault();
			t.repairsTabsTogler($(this));
		});
	}
}

Mts.formsData = {
	userData: {},
	composeObject: function() {
		Mts.formsData.userData = {};
		var t = this,
				harvestingArea = $('.planing-block'),
				room = $('.repairs-tabs'),
				roomName = $(this).attr('data-room'),
				repairType = $('.repairs-tab'),
				repairTypeName = $('.repairs-tab').attr('data-repair'),
				repairOption = $('input'),
				userActivity = false;

		t.userData.userId = Mts.common.userId;
		t.userData.userRooms = {};

		room.each(function() {
			var dataRoom = $(this).attr('data-room');
			if($(this).find('.repairs-tab').find('input[type="checkbox"]').is(':checked')) {
				t.userData.userRooms[dataRoom] = {};

				$(this).find('.repairs-tab').each(function(){
					var dataRepair = $(this).attr('data-repair');
					if($(this).find('input').is(':checked')) {
						t.userData.userRooms[dataRoom][dataRepair] = {};

						$(this).find('input').each(function(i){
							var dataOption = $(this).parent('.form-row').find('p').first().text();
							if(dataOption == undefined || dataOption == '') {
								dataOption = $(this).parent('.form-row').find('.text').val();
							}
								if($(this).is(':checked')) {
									t.userData.userRooms[dataRoom][dataRepair][i] = dataOption;
								}
						});
					}
				});
			}
		});

		localStorage.removeItem('sessionData');
		localStorage.setItem('sessionData', JSON.stringify(t.userData));
		console.log(t.userData);
	},


	printObject: function() {
		var t = this;
		$('.print-content').html('');
		$.each(Mts.formsData.userData.userRooms, function(i, v){
			$('.print-content').append('<p class="print-room">' + i + '</p>');

			$.each(v, function(i, v){
				$('.print-content').append('<p class="print-type">' + i + '</p>');

				$.each(v, function(i, v){
					$('.print-content').append('<p class="print-option"><span class="check-list"></span>' + v + '</p>');
				});
			});
		});
	},

	htmlObject: function() {
		var htmlForMail = [],
				t = this;
		htmlForMail.push('<link rel="stylesheet" href="http://mts.dev.grapheme.ru/styles/email.css">')
		htmlForMail.push('<img alt="Азбука ремонта" src="http://mts.dev.grapheme.ru/images/mail-head.jpg" style="width:100%">');
		$.each(Mts.formsData.userData.userRooms, function(i, v){
			htmlForMail.push('<h2>' + i + '</h2>');

			$.each(v, function(i, v){
				htmlForMail.push('<h3>' + i + '</h3>');

				$.each(v, function(i, v){
					htmlForMail.push('<p>' + '<font size="4">&#9744;</font> ' + v + '</p>');
				});
			});
		});
		htmlForMail.push('<span style="font-size: 12px; text-align: center; display: block;">Пожалуйста, не отвечайте на это письмо, оно было сформировано автоматически</span>');
		var strHTML = encodeURIComponent(htmlForMail.join(''));
		$('input.user-data').val(strHTML);
		$('input.user-subject').val(encodeURIComponent('Список дел для ремонта'));
	},

	checkItUp: function() {
		$.ajax({
			type: 'GET',
			url: 'http://www.inmyroom.ru/my/profile.json',
			dataType: 'json',
			success: function(json) {
				Mts.common.userId = json.id;
				if (json.is_logined)  {
					$.ajax({
						type: 'POST',
						url: 'http://inmyroom.grapheme.ru/get',
						dataType: 'json',
						data: {
							user_id: Mts.common.userId,
						},
						success: function(json) {
							if (json.data) {
								localStorage.removeItem('sessionData');
								localStorage.setItem('sessionData', json.data);
							}

							var localObject = JSON.parse(localStorage.getItem('sessionData'));
							$.each(localObject.userRooms, function(i, v) {
								var room = i;
								var roomBlock = $('.planing-block [data-room="' + i + '"]');
								$.each(v, function(i, v){
									var repairBlock = roomBlock.find('.repairs-tab[data-repair="' + i + '"]');
									$.each(v, function(i, v){
										if (repairBlock.find('p').eq(i).length > 0) {
											repairBlock.find('p').eq(i).parent().find('.checkbox').prop('checked', true);
										} else {
											repairBlock.find('.new-checkbox').before('<div class="form-row"><input type="checkbox" class="checkbox" checked="checked"><p>'+v+' </p></div>');
										}
										var planingBlockHeight = $('.planing-block .repairs-tabs.active .repairs-tab.active').height();
										$('.planing-block').animate({
											height: planingBlockHeight
										});
									});
								});
							})
						},
					});
				} else {
					var localObject = JSON.parse(localStorage.getItem('sessionData'));
					$.each(localObject.userRooms, function(i, v) {
						var room = i;
						var roomBlock = $('.planing-block [data-room="' + i + '"]');
						$.each(v, function(i, v){
							var repairBlock = roomBlock.find('.repairs-tab[data-repair="' + i + '"]');
							$.each(v, function(i, v){
								if (repairBlock.find('p').eq(i).length > 0) {
									repairBlock.find('p').eq(i).parent().find('.checkbox').prop('checked', true);
								} else {
									repairBlock.find('.new-checkbox').before('<div class="form-row"><input type="checkbox" class="checkbox" checked="checked"><p>'+v+' </p></div>');
								}
							});
						});
					})
				}
			},
			error: function(json) {
				var localObject = JSON.parse(localStorage.getItem('sessionData'));
				$.each(localObject.userRooms, function(i, v) {
					var room = i;
					var roomBlock = $('.planing-block [data-room="' + i + '"]');
					$.each(v, function(i, v){
						var repairBlock = roomBlock.find('.repairs-tab[data-repair="' + i + '"]');
						$.each(v, function(i, v){
							if (repairBlock.find('p').eq(i).length > 0) {
								repairBlock.find('p').eq(i).parent().find('.checkbox').prop('checked', true);
							} else {
								repairBlock.find('.new-checkbox').before('<div class="form-row"><input type="checkbox" class="checkbox" checked="checked"><p>'+v+' </p></div>');
							}
						});
					});
				})
			}
		});
	},

	init: function() {
		var t = this;
		$(document).on('click', '.repairs-tab .checkbox', function() {
			t.composeObject();
		});

		$('.toolbar .save').on('click', function() {

			$.ajax({
				type: 'GET',
				url: 'http://www.inmyroom.ru/my/profile.json',
				dataType: 'json',
				success: function(json) {
					Mts.common.userId = json.id;
					if (json.is_logined)  {
						$.ajax({
							type: 'POST',
							url: 'http://inmyroom.grapheme.ru/set',
							dataType: 'json',
							data: {
								user_id: Mts.common.userId,
								data: encodeURIComponent(localStorage.getItem('sessionData'))
							},
							success: function(json) {
								// console.log('success');
							},
							error: function() {
								alert('Не удалось сохранить данные. Повторите попытку позднее.');
							}
						});
					} else {
						location.replace('http://www.inmyroom.ru/registration?referer=http%3A%2F%2Fmtsazbukaremonta.inmyroom.ru%2F');
					}
				},
				error: function(json) {
					//return false;
				}
			});
		});
	}
}

Mts.articles = {

	getArticles: function() {
		roomFilter = $('.flat-plan .selected').attr('data-room');
		$('.articles-list').html('');
		$.ajax({
			type: 'GET',
			url: 'http://www.inmyroom.ru/static/api/mts_gpon.json',
			dataType: 'json',
			success: function(json) {
				var rooms = json.items,
						articlesArray = [];

				$.each(rooms, function(i, article){
					var room = article.room,
							category = article.category,
							imageURL = article.image,
							url = article.url,
							title = article.title;

					if (room == 1) {
						room = 'Кухня'
					} else if (room == 2) {
						room = 'Гостиная'
					} else if (room == 3) {
						room = 'Спальная комната'
					} else if (room == 4) {
						room = 'Ванная комната'
					} else if (room == 5) {
						room = 'Прихожая'
					} else if (room == 6) {
						room = 'Детская'
					};

					articlesArray.push('<li class="article');
					if(roomFilter == room){
						articlesArray.push(' filtered');
					};
					articlesArray.push('" data-room=' + room + '>');
					articlesArray.push('<a href="' + url + '">');
					articlesArray.push('<div style="background-image: url(' + imageURL + ');" class="article-img"></div>');
					articlesArray.push('<span class="category">' + category + '</span>');
					articlesArray.push('<p class="descrition">' + title + '</p></a></li>');
				});

				$('.articles-list').html(articlesArray.join(''));
				Mts.articles.showArticles();
				console.log(1)
			},
			error: function(json) {
				$('.articles-list').parent().parent().html('');
			}
		});
	},

	showArticles: function() {
		var counter = 0,
				roomFilter = $('.flat-plan .selected').attr('data-room'),
				filteredTotal = 0,
				visibleTotal = 0;

		$('.article').each(function(){
			var room = $(this).attr('data-room');
			if(roomFilter == room){
				filteredTotal = filteredTotal + 1;
			};
			if(! $(this).hasClass('visible') && counter < 3) {
				if($(this).hasClass('filtered')) {
					$(this).addClass('visible');
					counter = counter + 1;
					visibleTotal = visibleTotal + 1;

					if(filteredTotal > visibleTotal) {
						$('.show-more').hide();
					} else {
						$('.show-more').show();
					}
				}
			};
		});
	},

	init: function() {
		var t = this;

		t.getArticles();

		$('.show-more').on('click', function(e) {
			e.preventDefault();
			t.showArticles();
		});
	}
}

Mts.mail = {
	validateForm: function() {
			$('.send-mail').validate({
				rules: {
					email: {
						required: true,
						email: true
					}
				},
				messages: {
					email: {
						required: 'Укажите свой E-mail!',
						email: 'Проверьте корректность ввода!'
					}
				},

			submitHandler: function(form) {
				var options = {
					success: function(data){
						if(data.status) {
							$('.success-mail').addClass('active');
						} else {
							$('.error-mail').addClass('active');
						}
					},

					error: function(data) {
						$('.error-mail').addClass('active');
					}
				};
				$(form).ajaxSubmit(options);
				return false;
			}
		});
	},

	init: function() {
		var t = this;
		t.validateForm();
	}
}

$( document ).ready(function() {
	Mts.fixedHeader.init();
	Mts.common.init();
	Mts.rooms.init();
	Mts.formsData.init();
	Mts.articles.init();
	Mts.mail.init();
});

$('.content-wrapper.grey .content .gpon-block').click(function(){
	location.replace('http://gpon.mgts.ru/');
});
