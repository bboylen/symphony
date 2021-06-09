const SpotifyWebApi = require("spotify-web-api-node");
const setUpSpotifyApi = require("../utilities/spotifyWebApi");
const {
  createPlaylist,
  getOldTracks,
  createRemixedSongs,
  createRemixedPlaylist,
  populateRemixPlaylist,
} = require("../utilities/remixPlaylist");
const router = require("express").Router();
const User = require("../models/user-model");
const { Playlist, Song } = require("../models/playlist-model");
const CLIENT_HOME_PAGE_URL = "http://localhost:3000";

router.get("/playlists", (req, res) => {
  setUpSpotifyApi(req.user.username)
    .then((spotifyApi) => {
      spotifyApi
        .getUserPlaylists(req.user.username, {
          limit: 50,
        })
        .then(
          (data) => {
            res.status(200).json({
              success: true,
              playlists: data.body,
            });
          },
          (err) => {
            console.log("Error grabbing playlists", err);
          }
        );
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post("/playlist", (req, res) => {
  setUpSpotifyApi(req.user.username)
    .then((spotifyApi) => {
      spotifyApi.getPlaylist(req.body.playlistId).then(
        (data) => {
          res.status(200).json({
            success: true,
            playlist: data.body,
          });
        },
        (err) => {
          console.log("Error grabbing playlist", err);
        }
      );
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post("/remix", async (req, res) => {
  // How to handle errors in this route? 

  // Creates new playlist on spotify
  const newPlaylistName = `${req.body.playlistName} Remix`;
  const description = `A remix of ${req.body.playlistName}. Same artists - different songs!`;
  const newPlaylistId = await createPlaylist(
    newPlaylistName,
    description,
    req.user.username
  );

  // Fetch information on existing playlist songs
  const oldTracks = await getOldTracks(req.body.playlistId, req.user.username);

  // Create remixed Songs
  const remixedSongs = await createRemixedSongs(oldTracks, req.user.username);

  // Create/populate playlist model
  const remixedPlaylist = await createRemixedPlaylist(
    newPlaylistId,
    newPlaylistName,
    remixedSongs,
    req.user.spotifyId
  );

  // Populate playlist
  const playlistPopulationSuccess = await populateRemixPlaylist(newPlaylistId, remixedSongs, req.user.username);

  // Returns remixed playlists

  if (playlistPopulationSuccess) {

    const usersRemixedPlaylists = await Playlist.find({
      userId: req.user.spotifyId,
    });

    console.log(usersRemixedPlaylists);

    res.status(200).json({
      success: true,
      playlists: usersRemixedPlaylists,
      message: "Playlist remix successful",
    });
  } else {
    res.status(500).json({
      success: false,
      message: "Playlist remix failed"
    })
  }
  
});
module.exports = router;
