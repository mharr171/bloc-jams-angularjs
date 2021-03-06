(function() {
  function SongPlayer($rootScope, Fixtures) {
    /**
     * @desc SongPlayer object to be returned by function to make properties and methods accessible
     * @type {Object}
     */
    var SongPlayer = {};

    /**
     * @desc Stores current album info
     * @type {Object}
     */
    var currentAlbum = Fixtures.getAlbum();

    /**
     * @desc Buzz object audio file
     * @type {Object}
     */
    var currentBuzzObject = null;

    /**
     * @desc saved volume, used when muted
     * @type {Integer}
     */
    var savedVolume = null;

    /**
     * @function setSong
     * @desc Stops currently playing song and loads new audio file as currentBuzzObject
     * @param {Object} song
     */
    var setSong = function(song) {
      if (currentBuzzObject) {
        stopSong();
      }

      currentBuzzObject = new buzz.sound(song.audioUrl, {
        formats: ['mp3'],
        preload: true
      });

      currentBuzzObject.bind('timeupdate', function() {
        $rootScope.$apply(function() {
          SongPlayer.currentTime = currentBuzzObject.getTime();
        });
      });

      currentBuzzObject.bind('ended', function() {
        if (currentBuzzObject.isEnded()) {
          SongPlayer.next();
        }
      });

      SongPlayer.currentSong = song;
    };

    /**
     * @function playSong
     * @desc Plays currently playing song
     * @param {Object} song
     */
    var playSong = function(song) {
      currentBuzzObject.play();
      song.playing = true;
    };

    /**
     * @function stopSong
     * @desc Stops currently playing song
     */
    var stopSong = function() {
      currentBuzzObject.stop();
      SongPlayer.currentSong.playing = null;
    };

    /**
     * @function getSongIndex
     * @desc returns the index of song
     * @param {Object} song
     */
    var getSongIndex = function(song) {
      return currentAlbum.songs.indexOf(song);
    };

    /**
     * @desc Active song object from list of songs
     * @type {Object}
     */
    SongPlayer.currentSong = null;

    /**
     * @desc Current playback time (in seconds) of currently playing song
     * @type {Number}
     */
    SongPlayer.currentTime = null;

    /**
     * @function SongPlayer.play
     * @desc plays current or new song
     * @param {Object} song
     */
    SongPlayer.play = function(song) {
      song = song || SongPlayer.currentSong;
      if (SongPlayer.currentSong !== song) {
        setSong(song);
        playSong(song);
      } else if (SongPlayer.currentSong === song) {
        if (currentBuzzObject.isPaused()) {
          playSong(song);
        }
      }
    };

    /**
     * @function SongPlayer.pause
     * @desc pauses current songs
     * @param {Object} song
     */
    SongPlayer.pause = function(song) {
      song = song || SongPlayer.currentSong;
      currentBuzzObject.pause();
      song.playing = false;
    };

    /**
     * @function SongPlayer.previous
     * @desc Either goes to the previous song, or stops the song if its the first track
     */
    SongPlayer.previous = function() {
      var currentSongIndex = getSongIndex(SongPlayer.currentSong);
      currentSongIndex--;

      if (currentSongIndex < 0) {
        stopSong();
      } else {
        var song = currentAlbum.songs[currentSongIndex];
        setSong(song);
        playSong(song);
      }
    };

    /**
     * @function SongPlayer.next
     * @desc Either goes to the next song, or stops the song if its the last track
     */
    SongPlayer.next = function() {
      var currentSongIndex = getSongIndex(SongPlayer.currentSong);
      currentSongIndex++;

      if (currentSongIndex >= currentAlbum.songs.length) {
        stopSong();
      } else {
        var song = currentAlbum.songs[currentSongIndex];
        setSong(song);
        playSong(song);
      }
    };

    /**
     * @function setCurrentTime
     * @desc Set current time (in seconds) of currently playing song
     * @param {Number} time
     */
    SongPlayer.setCurrentTime = function(time) {
      if (currentBuzzObject) {
        currentBuzzObject.setTime(time);
      }
    };

    /**
     * @desc Current volume - also sets default
     * @type {Number}
     */
    SongPlayer.volume = 50;

    /**
     * @desc tracks whether the track is muted
     * @type {Boolean}
     */
    SongPlayer.muted = false;

    /**
     * @function setVolume
     * @desc Set volume
     * @param {Number} volume
     */
    SongPlayer.setVolume = function(volume) {
      if (currentBuzzObject) {
        if (currentBuzzObject.isMuted()) {
          currentBuzzObject.unmute();
          SongPlayer.muted = false;
        }
        currentBuzzObject.setVolume(volume);
        SongPlayer.volume = volume;

        if (SongPlayer.volume == 0) {
          SongPlayer.muted = true;
        } else {
          SongPlayer.muted = false;
        }
      }

    };

    /**
     * @function SongPlayer.mute
     * @desc mutes the volume
     */
    SongPlayer.mute = function() {
      if (currentBuzzObject.isMuted()) {
        currentBuzzObject.unmute();
        SongPlayer.volume = savedVolume;
        SongPlayer.muted = false;
      } else {
        savedVolume = currentBuzzObject.getVolume();
        currentBuzzObject.mute();
        SongPlayer.volume = 0;
        SongPlayer.muted = true;
      }
    };
    return SongPlayer;
  }

  angular
    .module('blocJams')
    .factory('SongPlayer', ['$rootScope', 'Fixtures', SongPlayer]);
})();
