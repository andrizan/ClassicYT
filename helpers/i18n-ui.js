/* Strings of the extension pages (popup, config, changelog). Loaded after helpers/i18n.js. */
Object.assign(reduxMessages.en, {
	languageTitle: 'Language',
	languageAuto: 'Auto',
	titleGithub: 'GitHub repository',
	titleExport: 'Export/import config',
	titleRestore: 'Restore defaults',
	settingsLegend: 'Settings',
	custom: 'Custom...',

	secGeneral: 'General',
	gridItems: 'Number of video thumbnails per row',
	gridItemsTip: 'Affects home, channel and subscriptions pages',
	extraLayout: 'Extra layout changes',
	extraLayoutTip: 'Adds more classic styles to multiple pages in order to match the old layout more closely.',
	extraLayoutWarn: 'Disabling this setting may cause incompatibility with other settings.',
	extraComments: 'Restore old comments styles',
	darkerRed: 'Use darker red color',
	noHomeScaling: 'No homepage scaling',
	noHomeScalingTip: 'When enabled it will prevent reducing empty space at the sides of the homepage which scales down with window size - page will retain its left/right padding.',
	extraSidebarStyles: 'Additional sidebar changes',
	playlistsFirst: 'Playlists grouping on homepage',
	sortFoundPlaylists: 'Strict grouping',
	sortFoundPlaylistsTip: 'While scrolling down the homepage, newly found playlists will be automatically grouped with others.',

	secVideoPage: 'Video Page',
	smallPlayer: 'Use small video player',
	smallPlayerTip: 'Player height displayed here is calculated for 16:9 aspect ratio and is based on width value. Actual height may differ based on your display.',
	blackBars: 'Use pillarboxing',
	blackBarsTip: 'Adds black bars to the sides of low aspect ratio videos (e.g. 4:3).',
	disableInfiniteScrolling: 'Disable infinite scrolling',
	disableInfiniteScrollingTip: "Limits displayed comments and related videos to 20 items. More will load upon clicking the 'SHOW MORE' button.",
	autoConfirm: "Auto confirm 'Video paused' popup",
	showRawValues: 'Show precise values for likes/dislikes',
	showRawValuesTip: 'E.g.: changes the displayed value of likes from 6K to 6312.',
	classicLikesColors: 'Use green/red colors for likes/dislikes bar',
	classicLikesIconColors: 'Use green/red colors for likes/dislikes buttons',
	classicLikesStyle: 'Use old icons for likes/dislikes',
	darkPlaylist: 'Use dark theme for playlists',
	immersiveFullscreen: 'Immersive fullscreen mode',
	immersiveFullscreenTip: 'While in fullscreen mode hides everything besides the exit button.',
	trueFullscreen: 'True fullscreen mode',
	trueFullscreenTip: 'Prevents scrolling while in fullscreen mode.',
	subBorder: 'Add border around subscribers count',
	trimSubs: 'Trim subscribers count',
	trimSubsTip: 'Trims the subscribers count text so that it only contains the number. May not be compatible with all languages.',
	trimViews: 'Trim view count',
	altStrings: 'Use alternative video page strings',
	altStringsTip: "Changes 'Save' button to 'Add to', adds 'Published on' to the upload date (will conflict with stream start date). Modified strings follow the extension language.",
	noPlayerActionAnimations: 'Disable video player action animations',
	noPlayerActionAnimationsTip: 'Hide animations when pausing, resuming and skipping forward/backward (displayed in the center of the player).',
	moveAutoplay: 'Move Auto-play back to related videos',
	disableMiniplayer: 'Disable miniplayer',

	secMisc: 'Misc',
	compatibleDislikes: 'Return YouTube Dislike compatibility',
	compatibleDislikesTip: 'Makes video page compatible with Return YouTube Dislike extension. Disable when experiencing issues with dislikes counter or bar.',
	redirectShorts: 'Redirect shorts to default video page',
	oldIcons: 'Restore old icons',
	oldIconsTip: 'Changes current flat/hollow icons to their old inverted/filled versions. Affects sidebar, video page, header icons and more.',
	altUploadIcon: 'Use old upload icon',
	extraChannel: 'Extra channel page changes',
	squareAvatar: 'Make own avatar square shaped',
	squareSubs: 'Make subs avatars square shaped',
	squareSearch: 'Make avatars in search results square shaped',
	squareComments: 'Make avatars in comments square shaped',
	altLoader: 'Use alternative video loader',
	altLoaderSmaller: 'Smaller!',
	customTitleFont: 'Custom video title font',
	collapseSidebar: 'Fully collapse sidebar on homepage',
	disableVideoPreview: 'Disable video preview',
	disableVideoPreviewTip: 'Hovering over video thumbnails will no longer play a short preview.',
	autoExpandSidebarSections: 'Auto expand sidebar sections',
	ignoreAmbientAdjustment: 'Ignore adjusting to Ambient Mode',
	ignoreAmbientAdjustmentTip: "When enabled the extension will no longer adjust the main window's background to be visually compatible with video player's Ambient Mode.",
	showChangelogPre: 'Show ',
	showChangelogLink: 'changelog',
	showChangelogPost: ' on updates',
	rearrangeInfo: 'Recreate old video page layout',
	rearrangeInfoTip: 'Unchecking this option will disable video page layout rearrangement caused by ClassicYT - Polymer (modern/default) layout will be used.',
	logoLegend: 'Logo',
	faviconLegend: 'Favicon',
	filterLegend: 'Video filter settings',
	filterTip: '• Mini scales all filters down.\n• No home: hides video filters on homepage\n• No video: hides video filters on video page',
	filterMini: 'Mini',
	filterNoHome: 'No home',
	filterNoVideo: 'No video',

	secVisibility: 'Features visibility',
	visibilityTip: 'If not enabled:'
		+ '\n• Shorts - removes the button from homepage and hides shorts in search results'
		+ '\n• Related videos age - removes this info (time since upload date) from related videos'
		+ '\n• Auto-play - removes the button from video player controls'
		+ '\n• Play on TV - removes the button from video player controls; AKA the Cast button which allows you to cast video to the paired TV'
		+ '\n• Join - removes the button from channel actions under the video player'
		+ '\n• Thanks - removes the button from video actions under the video player'
		+ "\n• Channel avatars on homepage - no effect when 'Extra layout changes' setting is enabled, which already hides channel avatars"
		+ '\n• Search with your voice - removes the button to the right of the search bar'
		+ '\n• Description extras - removes all extra info from video description'
		+ '\n• Video categories - removes this info from video description'
		+ '\n• Country code - removes this info from YouTube logo'
		+ '\n• Dislikes - removes the dislike button and count from video page'
		+ '\n• Download - removes the button from video page'
		+ '\n• Chapters in description - removes the chapters section from video description'
		+ '\n• Chapters in search - removes the chapters section from search results'
		+ '\n• Heatmap - removes the heatmap from above the video progress bar'
		+ '\n• Surveys - removes random surveys asking how would you rate certain videos and nudges for features activation'
		+ '\n• Homepage avatars - removes homepage channel avatars below video thumbnails'
		+ "\n• Mix Thumbnail Stack - removes visual indicators on top of video thumbnails that show it's a mix"
		+ '\n• Click animations - removes background animations of buttons when clicking on them (shadow, ripple, fill effects etc.)'
		+ '\n• Hashtags - removes hashtag links from video title and/or description header'
		+ '\n• Ticket shelf - removes ticket shelf section from video page'
		+ '\n• AI summary - removes AI summary section from video page'
		+ "\n• End Screen - removes end screen cards (thumbnails linking to other creator's videos) from the end of a video"
		+ '\n• Extra search categories - removes categories like "Channels new to you", "Previously watched", "From related searches" from search results',
	visShorts: 'Shorts',
	visRelatedAge: 'Related videos age',
	visAutoplay: 'Auto-play',
	visVoiceSearch: 'Search with your voice',
	visCast: 'Play on TV',
	visJoin: 'Join',
	visThanks: 'Thanks',
	visDescriptionExtras: 'Description extras',
	visVideoCategory: 'Video categories',
	visChaptersDescription: 'Chapters in description',
	visChaptersSearch: 'Chapters in search',
	visCountryCode: 'Country code',
	visDislikes: 'Dislikes',
	visDownload: 'Download',
	visHeatmap: 'Heatmap',
	visSurveys: 'Surveys',
	visHomeAvatars: 'Homepage avatars',
	visMixStack: 'Mix Thumbnail Stack',
	visClickAnimations: 'Click animations',
	visHashtags: 'Hashtags',
	visTicketShelf: 'Ticket shelf',
	visAISummary: 'AI summary',
	visEndScreen: 'End Screen',
	visExtraSearch: 'Extra search categories',

	note: 'Note: most settings require a page refresh to take effect.',
	donateMessage: 'Feel free to support the original author. Thank you!',
	donateAlt: 'Donation button',
	donateLeft: "❤️ YOU'RE",
	donateRight: 'AWESOME ❤️',
	promptFont: 'Enter your custom font name.\nTo reset it change to another value and then back to custom.',
	promptPlayerWidth: 'Enter your custom player width in pixels (height will be adjusted automatically).\nTo reset it change to another value and then back to custom.',
	confirmRestore: 'All settings will be reset to default values and current page will be refreshed. Continue?',

	configHeader: 'Export/import ClassicYT configuration',
	exportToFile: 'EXPORT TO FILE',
	exportToClipboard: 'EXPORT TO CLIPBOARD',
	importFromFile: 'IMPORT FROM FILE',
	importFromClipboard: 'IMPORT FROM CLIPBOARD',
	copyButton: 'COPY',
	importButton: 'IMPORT',
	exportPlaceholder: "Couldn't find data to export.",
	importPlaceholder: "Paste config here and press the 'Import' button.",
	requiresDownload: 'Requires download permissions',
	alertPermissionDenied: "Permission denied. File couldn't be saved. Use 'export to clipboard' and store the config manually",
	alertCopied: 'Copied config to clipboard',
	alertImportedFile: 'Config successfully imported from file',
	alertImportedClipboard: 'Config successfully imported from clipboard',
	alertInvalidConfig: 'Invalid config data. Nothing was imported.',

	changelogUpdated: '$1 has been updated to v.$2!',
	changelogInstalled: '$1 has been installed!',
	changelogToggle: 'Show changelog on updates',
	whatsNew: "What's new?",
	showMoreDots: 'Show more...',
	settingsHint: "You can access these settings via the extension's icon next to the address bar",
	githubRepo: 'GitHub repo'
});

Object.assign(reduxMessages.id, {
	languageTitle: 'Bahasa',
	languageAuto: 'Otomatis',
	titleGithub: 'Repositori GitHub',
	titleExport: 'Ekspor/impor konfigurasi',
	titleRestore: 'Kembalikan ke bawaan',
	settingsLegend: 'Pengaturan',
	custom: 'Kustom...',

	secGeneral: 'Umum',
	gridItems: 'Jumlah thumbnail video per baris',
	gridItemsTip: 'Berlaku untuk halaman beranda, channel, dan subscription',
	extraLayout: 'Perubahan tata letak tambahan',
	extraLayoutTip: 'Menambahkan lebih banyak gaya klasik di berbagai halaman agar lebih mirip tata letak lama.',
	extraLayoutWarn: 'Menonaktifkan pengaturan ini dapat menyebabkan ketidakcocokan dengan pengaturan lain.',
	extraComments: 'Kembalikan gaya komentar lama',
	darkerRed: 'Gunakan warna merah yang lebih gelap',
	noHomeScaling: 'Tanpa penskalaan beranda',
	noHomeScalingTip: 'Jika aktif, ruang kosong di sisi beranda tidak ikut mengecil mengikuti ukuran jendela - halaman mempertahankan padding kiri/kanannya.',
	extraSidebarStyles: 'Perubahan sidebar tambahan',
	playlistsFirst: 'Kelompokkan playlist di beranda',
	sortFoundPlaylists: 'Pengelompokan ketat',
	sortFoundPlaylistsTip: 'Saat menggulir beranda, playlist yang baru ditemukan otomatis dikelompokkan bersama yang lain.',

	secVideoPage: 'Halaman Video',
	smallPlayer: 'Gunakan pemutar video kecil',
	smallPlayerTip: 'Tinggi pemutar yang ditampilkan di sini dihitung untuk rasio aspek 16:9 berdasarkan nilai lebar. Tinggi sebenarnya bisa berbeda tergantung layar Anda.',
	blackBars: 'Gunakan pillarbox',
	blackBarsTip: 'Menambahkan bilah hitam di sisi video dengan rasio aspek rendah (mis. 4:3).',
	disableInfiniteScrolling: 'Nonaktifkan gulir tanpa batas',
	disableInfiniteScrollingTip: "Membatasi komentar dan video terkait yang tampil menjadi 20 item. Sisanya dimuat setelah menekan tombol 'TAMPILKAN LEBIH BANYAK'.",
	autoConfirm: "Konfirmasi otomatis popup 'Video dijeda'",
	showRawValues: 'Tampilkan angka persis suka/tidak suka',
	showRawValuesTip: 'Mis.: mengubah jumlah suka yang tampil dari 6 rb menjadi 6312.',
	classicLikesColors: 'Gunakan warna hijau/merah untuk bilah suka/tidak suka',
	classicLikesIconColors: 'Gunakan warna hijau/merah untuk tombol suka/tidak suka',
	classicLikesStyle: 'Gunakan ikon lama untuk suka/tidak suka',
	darkPlaylist: 'Gunakan tema gelap untuk playlist',
	immersiveFullscreen: 'Mode layar penuh imersif',
	immersiveFullscreenTip: 'Dalam mode layar penuh, menyembunyikan semuanya kecuali tombol keluar.',
	trueFullscreen: 'Mode layar penuh sejati',
	trueFullscreenTip: 'Mencegah pengguliran saat dalam mode layar penuh.',
	subBorder: 'Tambahkan bingkai di sekitar jumlah subscriber',
	trimSubs: 'Ringkas jumlah subscriber',
	trimSubsTip: 'Memangkas teks jumlah subscriber sehingga hanya berisi angka. Mungkin tidak kompatibel dengan semua bahasa.',
	trimViews: 'Ringkas jumlah tayangan',
	altStrings: 'Gunakan teks alternatif di halaman video',
	altStringsTip: "Mengubah tombol 'Simpan' menjadi 'Tambahkan ke' dan menambahkan 'Dipublikasikan pada' di depan tanggal unggah (akan bentrok dengan tanggal mulai streaming). Teks yang diubah mengikuti bahasa ekstensi.",
	noPlayerActionAnimations: 'Nonaktifkan animasi aksi pemutar video',
	noPlayerActionAnimationsTip: 'Menyembunyikan animasi saat menjeda, melanjutkan, dan melompat maju/mundur (yang tampil di tengah pemutar).',
	moveAutoplay: 'Pindahkan Putar otomatis kembali ke video terkait',
	disableMiniplayer: 'Nonaktifkan miniplayer',

	secMisc: 'Lain-lain',
	compatibleDislikes: 'Kompatibilitas Return YouTube Dislike',
	compatibleDislikesTip: 'Membuat halaman video kompatibel dengan ekstensi Return YouTube Dislike. Nonaktifkan jika penghitung atau bilah tidak suka bermasalah.',
	redirectShorts: 'Alihkan Shorts ke halaman video biasa',
	oldIcons: 'Kembalikan ikon lama',
	oldIconsTip: 'Mengganti ikon datar/berongga saat ini dengan versi lama yang terisi. Berlaku untuk sidebar, halaman video, ikon header, dan lainnya.',
	altUploadIcon: 'Gunakan ikon unggah lama',
	extraChannel: 'Perubahan tambahan halaman channel',
	squareAvatar: 'Jadikan avatar sendiri berbentuk kotak',
	squareSubs: 'Jadikan avatar subscription berbentuk kotak',
	squareSearch: 'Jadikan avatar di hasil penelusuran berbentuk kotak',
	squareComments: 'Jadikan avatar di komentar berbentuk kotak',
	altLoader: 'Gunakan animasi pemuatan video alternatif',
	altLoaderSmaller: 'Lebih kecil!',
	customTitleFont: 'Font judul video kustom',
	collapseSidebar: 'Ciutkan sidebar sepenuhnya di beranda',
	disableVideoPreview: 'Nonaktifkan pratinjau video',
	disableVideoPreviewTip: 'Mengarahkan kursor ke thumbnail video tidak lagi memutar pratinjau singkat.',
	autoExpandSidebarSections: 'Bentangkan bagian sidebar otomatis',
	ignoreAmbientAdjustment: 'Abaikan penyesuaian Mode Ambient',
	ignoreAmbientAdjustmentTip: 'Jika aktif, ekstensi tidak lagi menyesuaikan latar belakang jendela utama agar selaras dengan Mode Ambient pemutar video.',
	showChangelogPre: 'Tampilkan ',
	showChangelogLink: 'catatan perubahan',
	showChangelogPost: ' saat ada pembaruan',
	rearrangeInfo: 'Buat ulang tata letak halaman video lama',
	rearrangeInfoTip: 'Menghapus centang opsi ini akan menonaktifkan penataan ulang halaman video oleh ClassicYT - tata letak Polymer (modern/bawaan) yang akan digunakan.',
	logoLegend: 'Logo',
	faviconLegend: 'Favicon',
	filterLegend: 'Pengaturan filter video',
	filterTip: '• Mini: mengecilkan semua filter.\n• Tanpa beranda: menyembunyikan filter video di beranda\n• Tanpa video: menyembunyikan filter video di halaman video',
	filterMini: 'Mini',
	filterNoHome: 'Tanpa beranda',
	filterNoVideo: 'Tanpa video',

	secVisibility: 'Visibilitas fitur',
	visibilityTip: 'Jika tidak diaktifkan:'
		+ '\n• Shorts - menghapus tombolnya dari beranda dan menyembunyikan Shorts di hasil penelusuran'
		+ '\n• Usia video terkait - menghapus info ini (waktu sejak tanggal unggah) dari video terkait'
		+ '\n• Putar otomatis - menghapus tombolnya dari kontrol pemutar video'
		+ '\n• Putar di TV - menghapus tombolnya dari kontrol pemutar video; alias tombol Cast untuk mentransmisikan video ke TV yang tersambung'
		+ '\n• Gabung - menghapus tombolnya dari aksi channel di bawah pemutar video'
		+ '\n• Terima kasih - menghapus tombolnya dari aksi video di bawah pemutar video'
		+ "\n• Avatar channel di beranda - tidak berpengaruh jika 'Perubahan tata letak tambahan' aktif, karena pengaturan itu sudah menyembunyikan avatar channel"
		+ '\n• Telusuri dengan suara - menghapus tombol di sebelah kanan kolom penelusuran'
		+ '\n• Ekstra deskripsi - menghapus semua info tambahan dari deskripsi video'
		+ '\n• Kategori video - menghapus info ini dari deskripsi video'
		+ '\n• Kode negara - menghapus info ini dari logo YouTube'
		+ '\n• Tidak suka - menghapus tombol dan jumlah tidak suka dari halaman video'
		+ '\n• Download - menghapus tombolnya dari halaman video'
		+ '\n• Bab di deskripsi - menghapus bagian bab dari deskripsi video'
		+ '\n• Bab di penelusuran - menghapus bagian bab dari hasil penelusuran'
		+ '\n• Heatmap - menghapus heatmap dari atas bilah progres video'
		+ '\n• Survei - menghapus survei acak yang meminta penilaian video serta ajakan mengaktifkan fitur'
		+ '\n• Avatar beranda - menghapus avatar channel di bawah thumbnail video di beranda'
		+ '\n• Tumpukan thumbnail Mix - menghapus penanda visual di atas thumbnail video yang menunjukkan bahwa itu sebuah Mix'
		+ '\n• Animasi klik - menghapus animasi latar tombol saat diklik (bayangan, riak, efek isian, dll.)'
		+ '\n• Hashtag - menghapus tautan hashtag dari judul video dan/atau header deskripsi'
		+ '\n• Rak tiket - menghapus bagian rak tiket dari halaman video'
		+ '\n• Ringkasan AI - menghapus bagian ringkasan AI dari halaman video'
		+ '\n• Layar akhir - menghapus kartu layar akhir (thumbnail yang menautkan ke video kreator lain) di akhir video'
		+ '\n• Kategori penelusuran tambahan - menghapus kategori seperti "Channel baru untuk Anda", "Sudah ditonton", "Dari penelusuran terkait" dari hasil penelusuran',
	visShorts: 'Shorts',
	visRelatedAge: 'Usia video terkait',
	visAutoplay: 'Putar otomatis',
	visVoiceSearch: 'Telusuri dengan suara',
	visCast: 'Putar di TV',
	visJoin: 'Gabung',
	visThanks: 'Terima kasih',
	visDescriptionExtras: 'Ekstra deskripsi',
	visVideoCategory: 'Kategori video',
	visChaptersDescription: 'Bab di deskripsi',
	visChaptersSearch: 'Bab di penelusuran',
	visCountryCode: 'Kode negara',
	visDislikes: 'Tidak suka',
	visDownload: 'Download',
	visHeatmap: 'Heatmap',
	visSurveys: 'Survei',
	visHomeAvatars: 'Avatar beranda',
	visMixStack: 'Tumpukan thumbnail Mix',
	visClickAnimations: 'Animasi klik',
	visHashtags: 'Hashtag',
	visTicketShelf: 'Rak tiket',
	visAISummary: 'Ringkasan AI',
	visEndScreen: 'Layar akhir',
	visExtraSearch: 'Kategori penelusuran tambahan',

	note: 'Catatan: sebagian besar pengaturan memerlukan muat ulang halaman agar berlaku.',
	donateMessage: 'Silakan dukung pembuat aslinya. Terima kasih!',
	donateAlt: 'Tombol donasi',
	donateLeft: '❤️ KAMU',
	donateRight: 'LUAR BIASA ❤️',
	promptFont: 'Masukkan nama font kustom Anda.\nUntuk mengatur ulang, pilih nilai lain lalu kembali ke kustom.',
	promptPlayerWidth: 'Masukkan lebar pemutar kustom dalam piksel (tinggi akan disesuaikan otomatis).\nUntuk mengatur ulang, pilih nilai lain lalu kembali ke kustom.',
	confirmRestore: 'Semua pengaturan akan dikembalikan ke nilai bawaan dan halaman saat ini akan dimuat ulang. Lanjutkan?',

	configHeader: 'Ekspor/impor konfigurasi ClassicYT',
	exportToFile: 'EKSPOR KE FILE',
	exportToClipboard: 'EKSPOR KE CLIPBOARD',
	importFromFile: 'IMPOR DARI FILE',
	importFromClipboard: 'IMPOR DARI CLIPBOARD',
	copyButton: 'SALIN',
	importButton: 'IMPOR',
	exportPlaceholder: 'Tidak ada data untuk diekspor.',
	importPlaceholder: "Tempel konfigurasi di sini lalu tekan tombol 'Impor'.",
	requiresDownload: 'Memerlukan izin download',
	alertPermissionDenied: "Izin ditolak. File tidak dapat disimpan. Gunakan 'ekspor ke clipboard' dan simpan konfigurasi secara manual",
	alertCopied: 'Konfigurasi disalin ke clipboard',
	alertImportedFile: 'Konfigurasi berhasil diimpor dari file',
	alertImportedClipboard: 'Konfigurasi berhasil diimpor dari clipboard',
	alertInvalidConfig: 'Data konfigurasi tidak valid. Tidak ada yang diimpor.',

	changelogUpdated: '$1 telah diperbarui ke v.$2!',
	changelogInstalled: '$1 telah dipasang!',
	changelogToggle: 'Tampilkan catatan perubahan saat pembaruan',
	whatsNew: 'Apa yang baru?',
	showMoreDots: 'Tampilkan lebih banyak...',
	settingsHint: 'Anda dapat mengakses pengaturan ini melalui ikon ekstensi di sebelah bilah alamat',
	githubRepo: 'Repo GitHub'
});

/* Applies the current language to every element carrying a data-i18n* attribute:
   data-i18n sets the text, data-i18n-<name> sets the attribute listed below (data-hint feeds CSS content). */
const localizedAttributes = { 'title': 'title', 'placeholder': 'placeholder', 'alt': 'alt', 'aria-label': 'aria-label', 'hint': 'data-hint' };

function localizePage(root = document) {
	for (const element of root.querySelectorAll('[data-i18n]')) {
		element.textContent = t(element.dataset.i18n);
	}
	for (const name in localizedAttributes) {
		const dataName = `data-i18n-${name}`;
		for (const element of root.querySelectorAll(`[${dataName}]`)) {
			element.setAttribute(localizedAttributes[name], t(element.getAttribute(dataName)));
		}
	}
	document.documentElement.lang = reduxLanguage;
}
