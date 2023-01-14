import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import firebase from "../firebase";
import useAuth from "../hooks/useAuth";
import { onSnapshot, query, doc, collection, where, addDoc } from "firebase/firestore";
import { FontAwesome5 } from "@expo/vector-icons";

const Post = ({ post }) => {
  const [data, setData] = useState([]);
  const navigation = useNavigation();
  const { user } = useAuth();
  const [comments, setComments] = useState(false);
  const [text, onChangeText] = useState("");
  const [userInfo, setUserInfo] = useState([]);
  const [postInfo, setPostInfo] = useState([])
  const [ReplyModal, setReplyModal] = useState(false);
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])

  

  onSnapshot(
    query(
      collection(firebase.firestore(), "users"),
      where("owner_uid", "==", user.uid)
    ),
    (snapshot) => {
      setUserInfo(snapshot.docs);
    }
  );

  const handleLike = (post) => {
      const currentLikeStatus = !post.likes_by_users.map(like => like.email).includes(user.email);
      const profile = userInfo.map(info => info.data().profile_picture).pop()
      const username = userInfo.map(info => info.data().username).pop()
   
    firebase
      .firestore()
      .collection("users")
      .doc(post.owner_email)
      .collection("posts")
      .doc(post.id)
      .update({
        likes_by_users: currentLikeStatus
          ? firebase.firestore.FieldValue.arrayUnion({email: user.email , profile: profile, username: username})
          : firebase.firestore.FieldValue.arrayRemove({email: user.email, profile: profile, username: username}),
      })
      
  
  };

  const handleSubmit = async () => {
    firebase.firestore()
      .collection("users")
      .doc(postInfo.owner_email)
      .collection("posts")
      .doc(postInfo.id)
      .update({
        comments: firebase.firestore.FieldValue.arrayUnion({ user: user.email, replyText: text })
      })
    setReplyModal(false)
  }

  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={ReplyModal}

      >
        <View style={styles.centeredView} >
          <View style={styles.modalView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="arrow-back" size={24} color="black" onPress={() => setReplyModal(false)} />
              <Text style={{ fontSize: 15, marginLeft: 4 }}>Compose A Reply</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, marginleft: 10 }}>
              <Text style={{ fontSize: 13, marginLeft: 4 }}>Replying to</Text>
              <Text style={{ color: '#7EA8F7', fontSize: 13 }}> {postInfo.lowerUsername}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18, backgroundColor: '#E9E9E9', padding: 5, borderRadius: 8 }}>
              <Feather name="smile" size={20} color="black" />
              <TextInput placeholder="Say Something...." style={{ flex: 1, marginLeft: 8, marginRight: 8 }} value={text} onChangeText={onChangeText} />
              <Feather name="send" size={20} color="black" onPress={handleSubmit} />
            </View>
          </View>
        </View>
      </Modal>
      <View style={{ margin: 5, borderRadius: 12, backgroundColor: '#F4F4F4' }}>
        {/* background #F9FFFF was used previously */}

        <PostHeader post={post} navigation={navigation} userInfo={userInfo} />
        <PostBody post={post} navigation={navigation} user={user}/>
        <PostFooter
          post={post}
          handleLike={handleLike}
          user={user}
          comments={comments}
          setComments={setComments}
          text={text}
          onChangeText={onChangeText}
          setReplyModal={setReplyModal}
          setPostInfo={setPostInfo}
        />

      </View>
    </View>
  );
};
const PostHeader = ({ post, navigation, follower, following, userInfo }) => (
  <View
    style={{ justifyContent: "space-between", flexDirection: "row", margin: 5 }}
  >
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
      <View>
        <Image
          style={{ width: 34, height: 34, borderRadius: 50, marginLeft: 4 }}
          source={{ uri: post.profilePicture }}
        />
      </View>
      <View>
        <Text
          style={{ marginLeft: 6, fontWeight: "bold", fontSize: 14 }}
          onPress={() =>
            navigation.navigate("UserProfile", {
              username: post.username,
              lowerUsername: post.lowerUsername,
              profile: post.profilePicture,
              uid: post.owner_uid,
              follower: follower,
              following: following,
              email: post.owner_email,

            })
          }
        >
          {post.username}
        </Text>
        <View style={{ flexDirection: "row", alignItems: 'center' }}>

          <Text style={{ marginLeft: 6, fontSize: 11, fontWeight: '400' }}>10 mins ago</Text>
        </View>
      </View>
    </View>
    <View>
      <Text style={{ marginRight: 10, fontSize: 22, color: 'grey' }}>...</Text>
    </View>
  </View>
);
const PostBody = ({ post, navigation, user }) => (
 <TouchableOpacity onPress={() => navigation.push("UserPost", {
  username: post.username, 
 
  post: post
 })}>
   <View >
    <View
      style={{
        marginLeft: 15,
        marginRight: 15,
        marginTop: 10,

      }}
    >
      <Text style={{ fontSize: 15, fontWeight: "400", marginBottom: 4, fontFamily: 'Roboto' }}>{post.posttext} </Text>
    </View>
    <View>
      {post.image && (
        <Image
          style={{
            alignSelf: "stretch",
            height: 400,
            marginLeft: 15,
            marginRight: 15,
            borderRadius: 10,
          }}
          source={{ uri: post?.image }}
        />
      )}
    </View>
    <View
      style={{
        marginTop: 15,
        marginRight: 15,
        marginLeft: 15,
        paddingBottom: 6,
        flexDirection: "row",
        borderBottomColor: '#E7E7E7',
        borderBottomWidth: 1,
        alignItems: 'center'
      }}
    >
      
      
{post.likes_by_users.length > 0 &&(
          <Image
          style={{ width: 28, height: 28, borderRadius: 50, margin: 4, }}
          source={{ uri: post.likes_by_users.slice(-1)[0]?.profile}}
        />
  
)}      
      {post.likes_by_users.length > 1 &&(
        <Image
        style={{ width: 28, height: 28, borderRadius: 50, margin: 4, left: -16 }}
        source={{ uri: post.likes_by_users.slice(-2)[0]?.profile }}
      />
      )}
    
      {post.likes_by_users.length > 2 &&(
         <Image
       style={{ width: 32, height: 32, borderRadius: 50, margin: 4, left: -32 }}
       source={{ uri: post.likes_by_users.slice(-3)[0]?.profile }}
     />
      )}
     

      {post.likes_by_users.length == 1 &&(
        <Text style={{ color: '#A9A9A9' }}>{ post.likes_by_users.slice(-1)[0].email == user.email ? "You Liked It! " : post.likes_by_users.slice(-1)[0].username} </Text>
      )}
       {post.likes_by_users.length == 2 &&(
        <Text style={{left: -18, color: '#A9A9A9' }}>{post.likes_by_users.slice(-2)[0].username}  and others likes it.</Text>
      )}
       {post.likes_by_users.length >= 3 &&(
        <Text style={{left: -32, color: '#A9A9A9' }}>{post.likes_by_users.slice(-3)[0].username}  and others likes it.</Text>
      )}
    </View>

  </View>
 </TouchableOpacity>
);
const PostFooter = ({
  post,
  handleLike,
  user,
  comments,
  setComments,
  text,
  onChangeText,
  userInfo,
  setReplyModal,
  setPostInfo,
}) => (
  <View style={{ margin: 10 }}>
    <View
      style={{
        flexDirection: "row",
        alignItems: 'center',
        marginLeft: 8,
        marginRight: 8,

      }}
    >
      <TouchableOpacity
        style={{ flexDirection: "row", borderRadius: 4,padding: 2, }}
        onPress={() => handleLike(post)}
      >
        {post.likes_by_users.map(like => like.email).includes(user.email) ? (
          <Ionicons name="heart" size={21} color="red" />
        ) : (
          <Ionicons name="heart-outline" size={21} color="black" />
        )}
        <Text style={{ marginLeft: 6, fontSize: 16, marginRight: 6 }}>
          {post.likes_by_users.length} {post.likes_by_users.length != 1 ? 'Likes' : 'Like' }
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ flexDirection: "row", marginLeft: 12, padding: 4, borderRadius: 4 }}
        onPress={() =>
          comments == true ? setComments(false) : setComments(true)
        }
      >
        <Ionicons name="chatbubble-outline" size={21} color="black" />
        <Text style={{ marginLeft: 4, fontSize: 16 }}>{post.comments.length} {post.comments.length === 1 ? "Comment" : "Comments" }</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => { setReplyModal(true); setPostInfo(post)}}>
        <Octicons name="reply" size={24} color="black" />
      </TouchableOpacity> */}

      {/* <TouchableOpacity style={{ flexDirection: "row" }}>
        <Feather name="share" size={24} color="black" />
      </TouchableOpacity> */}
    </View>


    {comments == true && (
      <View style={{ marginTop: 10, width: "100%", }}>
        {post.comments.map((comment, index) => (

          <View style={{ flexDirection: "row", marginBottom: 4 }}>
            <Image
              style={{ width: 24, height: 24, borderRadius: 50, marginLeft: 4 }}
              source={{ uri: post.profilePicture }}
            />
            <View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ marginLeft: 4 }}>Aniket Mishra </Text>
                  <Text >  |  </Text>
                  <Text style={{ marginRight: 4, fontSize: 12 }}>10 min ago</Text>
                </View>

              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: 4,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '100' }}>Replying to </Text>
                <Text style={{ fontSize: 12, color: "blue" }}>@aniketmishra</Text>
              </View>

              <Text style={{ marginLeft: 4 }}>{comment.replyText}</Text>
            </View>
          </View>
        ))}

      </View>


    )}



  </View>
);
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: "#00000aaa",

  },
  modalView: {

    backgroundColor: "white",
    borderRadius: 2,
    padding: 10,
    borderRadius: 14,
    marginLeft: 10,
    marginRight: 10,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },

  modalText: {

  }
});

export default Post;
