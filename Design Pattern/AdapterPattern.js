/* 
!!!The Adapter pattern allows two incompatible interfaces to work together. 
!!! It's like a translator between two systems that don’t naturally talk to each other.
 */

class OldMediaPlayer {
  playMps3(fileName) {
    console.log(`Playing mp3 file: ${fileName}`);
  }
}

class Mp4Player {
  playMp4(fileName) {
    console.log(`Playing mp4 file: ${fileName}`);
  }
}

class VlcPlayer {
  playVlc(fileName) {
    console.log(`Playing Vlc file: ${fileName}`);
  }
}

// Adapter to make OldMediaPlayer work with mp4 and vlc
class MediaAdapter {
  constructor(fileType) {
    if (fileType === "mp4") {
      this.advancedPlayer = new Mp4Player();
    } else if (fileType === "vlc") {
      this.advancedPlayer = new VlcPlayer();
    }
  }
  play(fileType, fileName) {
    if (fileType === "mp4") {
      this.advancedPlayer.playMp4(fileName);
    } else if (fileType === "vlc") {
      this.advancedPlayer.playVlc(fileName);
    }
  }
}

class NewMediaPlayer {
  play(fileType, fileName) {
    if (fileType === "mp3") {
      console.log(`Playing mp3 file: ${fileName}`);
    } else if (fileType === "mp4" || fileType === "vlc") {
      const adapter = new MediaAdapter(fileType);
      adapter.play(fileType, fileName);
    } else {
      console.log("Unsupported format");
    }
  }
}

const player = new NewMediaPlayer();
player.play("mp3", "song.mp3");
player.play("mp4", "video.mp4");
player.play("vlc", "media.vlc");
