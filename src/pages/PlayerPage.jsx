import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import {
  fetchPlaylistBySlug,
  clearCurrentPlaylist,
} from "../redux/slices/playlistSlice";

import {
  setVideos,
  setCurrentIndex,
  resetPlayer,
} from "../redux/slices/playerSlice";

import { incrementView } from "../api/endpoints";

import VideoPlayer from "../components/VideoPlayer";
import LibraryOverlay from "../components/LibraryOverlay";
import CommentsSheet from "../components/CommentsSheet";
import Loading from "../components/Loading";

export default function PlayerPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State
  const { currentPlaylist, loading } = useSelector((state) => state.playlists);
  const { currentVideoIndex } = useSelector((state) => state.player);
  const videos = currentPlaylist?.videos || [];

  // Comments modal state - lifted here to render above peek area
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // Dynamic screen height - updates on resize/orientation change
  const [screenHeight, setScreenHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800
  );

  useEffect(() => {
    const updateHeight = () => setScreenHeight(window.innerHeight);
    window.addEventListener("resize", updateHeight);
    // Also listen for orientation change on mobile
    window.addEventListener("orientationchange", () => {
      setTimeout(updateHeight, 100);
    });
    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, []);

  const PEEK_HEIGHT = 40;
  const SHEET_CLOSED_Y = screenHeight - PEEK_HEIGHT;
  const SHEET_OPEN_Y = screenHeight * 0.4;
  const sheetY = useMotionValue(SHEET_CLOSED_Y);

  // Reset sheet position when screen height changes
  useEffect(() => {
    sheetY.set(screenHeight - PEEK_HEIGHT);
  }, [screenHeight]);

  const videoScale = useTransform(sheetY, (y) => {
    // When sheet is at or below closed position, video is full size
    if (y >= SHEET_CLOSED_Y) return 1;
    // When dragged up, scale proportionally
    return y / SHEET_CLOSED_Y;
  });

  const videoRadius = useTransform(
    sheetY,
    [SHEET_OPEN_Y, SHEET_CLOSED_Y],
    [16, 0]
  );

  const blurOpacity = useTransform(
    sheetY,
    [SHEET_OPEN_Y, SHEET_CLOSED_Y],
    [1, 0]
  );

  // Initial Data Load
  const initialIndex = parseInt(searchParams.get("v") || "0", 10);
  useEffect(() => {
    dispatch(fetchPlaylistBySlug(slug));
    return () => {
      dispatch(clearCurrentPlaylist());
      dispatch(resetPlayer());
    };
  }, [slug, dispatch]);

  useEffect(() => {
    if (videos.length > 0) {
      dispatch(setVideos(videos));
      if (initialIndex > 0 && initialIndex < videos.length) {
        dispatch(setCurrentIndex(initialIndex));
      }
      incrementView(videos[currentVideoIndex]?.video_id).catch(() => {});
    }
  }, [videos.length]);

  // No snapping - free-form drag

  // Switch video handler
  const handleVideoSelect = (index) => {
    dispatch(setCurrentIndex(index));
    incrementView(videos[index]?.video_id).catch(() => {});
  };

  if (loading) return <Loading />;

  if (!currentPlaylist || videos.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <p className="text-gray-400 mb-4">No videos found</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-accent text-black font-medium rounded-full"
        >
          Go Home
        </button>
      </div>
    );
  }

  const currentVideo = videos[currentVideoIndex];
  if (!currentVideo) return null;

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* 1. Blurred Background Layer */}
      <motion.div
        className="absolute inset-0 z-0 opacity-0"
        style={{ opacity: blurOpacity }}
      >
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img
          src={currentVideo.thumbnail_url}
          alt=""
          className="w-full h-full object-cover blur-3xl scale-110"
        />
      </motion.div>

      {/* Back Button (Fixed) */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      {/* 2. Transformable Video Container */}
      <motion.div
        className="absolute inset-0 z-10 origin-top overflow-hidden bg-black"
        style={{
          scale: videoScale,
          borderRadius: videoRadius,
        }}
      >
        <VideoPlayer
          key={currentVideo.video_id}
          video={currentVideo}
          playlist={currentPlaylist}
          isActive={true}
          onOpenComments={() => setShowComments(true)}
          onCommentCountChange={setCommentCount}
          commentCount={commentCount}
        />
      </motion.div>

      {/* 3. Draggable Sheet - swipe up from bottom to reveal */}
      <motion.div
        drag="y"
        dragConstraints={{ top: SHEET_OPEN_Y, bottom: SHEET_CLOSED_Y }}
        dragElastic={0.1}
        dragMomentum={true}
        style={{ y: sheetY }}
        className="absolute left-0 right-0 h-screen z-20 will-change-transform touch-manipulation"
      >
        <LibraryOverlay
          videos={videos}
          playlist={currentPlaylist}
          currentIndex={currentVideoIndex}
          onVideoSelect={handleVideoSelect}
        />
      </motion.div>

      {/* Comments Sheet - rendered at top level to be above peek area */}
      <CommentsSheet
        show={showComments}
        videoId={currentVideo?.video_id}
        onClose={() => setShowComments(false)}
        onCountChange={setCommentCount}
      />
    </div>
  );
}
