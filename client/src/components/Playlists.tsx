import React, { useState, useEffect, useRef } from "react";
import { User } from "../util/types";
import { Layout, Menu, Typography, Table, Button } from "antd";
import { UserOutlined, LaptopOutlined } from "@ant-design/icons";
import "../styles/Playlists.css";
import { PageHeader } from "antd";

const { SubMenu } = Menu;
const { Content, Sider } = Layout;
const { Title } = Typography;

interface PlaylistProps {
  user: User;
}

export const Playlists: React.FC<PlaylistProps> = (props) => {
  const { user } = props;
  const [userPlaylists, setUserPlaylists] = useState<any>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>();
  const [playlistData, setPlaylistData] = useState<any>([]);
  const [remixedPlaylists, setRemixedPlaylists] = useState<any>([]);
  const [remixedPlaylistData, setRemixedPlaylistData] = useState<any>([]);
  const [loading, setLoading] = useState<Boolean>(true);

  // Put fetch requests in a module 
  
  const getPlaylists = () => {
    fetch(`http://localhost:3001/spotify/playlists`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error("failed to fetch user playlists");
      })
      .then((responseJson) => {
        setUserPlaylists(responseJson.playlists.items);
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setLoading(false);
      });
  };

  const getRemixedPlaylists = () => {
    fetch(`http://localhost:3001/spotify/remixedPlaylists`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error("failed to fetch user playlists");
      })
      .then((responseJson) => {
        setRemixedPlaylists(responseJson.playlists);
      })
      .catch((error) => console.log(error))
      
  };

  const getPlaylist = (playlistId: string) => {
    fetch(`http://localhost:3001/spotify/playlist`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playlistId: playlistId }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error("failed to fetch user playlist");
      })
      .then((responseJson) => {
        setSelectedPlaylist(responseJson.playlist);
      })
      .catch((error) => console.log(error));
  };

  const remixPlaylist = async (playlistId: string, playlistName: string) => {
    await fetch(`http://localhost:3001/spotify/remix`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playlistId: playlistId,
        playlistName: playlistName,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error("failed to remix user playlist");
      })
      .then((responseJson) => {
        if (responseJson.playlists) {
          setRemixedPlaylists(responseJson.playlists);
          getPlaylist(responseJson.spotifyId);
        }
      })
      .catch((error) => console.log(error));
    return;
  };

  const handleRemix = async () => {
    await remixPlaylist(selectedPlaylist.id, selectedPlaylist.name);
    // Can add loading / populate generated playlist
    getPlaylists();
  };

  const selectPlaylist = (playlistKey: any) => {
    console.log(playlistKey)
    // if key is in ${LIST_OF_REMIXED_KEYS} set ${REMIX_SELECTED} to true
    // conditional render of delete button based on ${REMIX_SELECTED}
    getPlaylist(playlistKey.key);
  };

  useEffect(() => {
    if (userPlaylists.length > 0) {
      selectPlaylist(userPlaylists[0].id);
    }
  }, [userPlaylists]);

  useEffect(() => {
    getPlaylists();
    getRemixedPlaylists();
  }, []);

  useEffect(() => {
    if (selectedPlaylist) {
      let data = selectedPlaylist.tracks.items.map((song: any) => {
        return {
          key: song.track.id,
          songName: song.track.name,
          artist: song.track.artists[0].name,
          album: song.track.album.name,
        };
      });
      setPlaylistData(data);
    }
  }, [selectedPlaylist]);

  const columns = [
    {
      title: "Title",
      dataIndex: "songName",
      key: "name",
    },
    {
      title: "Artist",
      dataIndex: "artist",
      key: "artist",
    },
    {
      title: "Album",
      dataIndex: "album",
      key: "album",
    },
  ];

  if (loading) return null;

  return (
    <div className="Playlists" style={{ height: "100%" }}>
      <Layout style={{ height: "100%" }}>
        <Sider
          width={300}
          className="site-layout-background"
          collapsible={true}
          collapsedWidth={40}
          theme={"light"}
          style={{ height: "100%", overflow: "auto" }}
        >
          <Menu
            mode="inline"
            defaultOpenKeys={["sub1", "sub2"]}
            defaultSelectedKeys={[userPlaylists[0].id]}
            style={{ height: "100%", borderRight: 0 }}
            onClick={(playlist) => selectPlaylist(playlist)}
          >
            <SubMenu
              key="sub1"
              icon={<UserOutlined />}
              title="Your Playlists"
              style={{
                maxHeight: "60%",
                overflow: "auto",
                overflowX: "hidden",
              }}
            >
              {userPlaylists.map((playlist: any) => {
                return (
                  <Menu.Item
                    key={playlist.id}
                    style={{
                      padding: "0px 5px 0px 15px",
                    }}
                  >
                    {playlist.name}
                  </Menu.Item>
                );
              })}
            </SubMenu>
            <SubMenu
              key="sub2"
              icon={<LaptopOutlined />}
              title="Generated Playlists"
            >
              {remixedPlaylists.map((playlist: any) => {
                return (
                  <Menu.Item
                    key={playlist.spotifyId}
                    style={{
                      padding: "0px 5px 0px 15px",
                    }}
                  >
                    {playlist.name}
                  </Menu.Item>
                );
              })}
            </SubMenu>
          </Menu>
        </Sider>
        <Content
          className="site-layout-background"
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            height: "100%",
            backgroundColor: "white",
          }}
        >
          {selectedPlaylist && (
            <PageHeader
              title={selectedPlaylist.name}
              extra={
                // Ternary based on whether playlist is remixed or not!
                true ? (<Button
                  onClick={handleRemix}
                  size={"large"}
                  danger
                  type={"primary"}
                >
                  Remix
                </Button>) : null
                
              }
            />
          )}
          {selectedPlaylist && (
            <Table
              dataSource={playlistData}
              columns={columns}
              sticky={true}
              pagination={{ pageSize: 1000, position: [] }}
              scroll={{ y: "65vh" }}
            />
          )}
        </Content>
      </Layout>
    </div>
  );
};
