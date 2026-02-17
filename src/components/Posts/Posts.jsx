import React from 'react'
import {useSelector} from 'react-redux';
import { Grid, CircularProgress, Paper} from '@material-ui/core';
import Post from './Post/Post';
import useStyles from './styles';


 const Posts = () => {
    const classes = useStyles();
    const {posts, isLoading} = useSelector((state) => state.posts);

    //remove due to pagination handle fetching posts
    // const dispatch = useDispatch();

    // useEffect(() => {
    //     dispatch(getPosts());
    // }, [dispatch]);

    if (!posts.length && !isLoading) return 'No posts';

    return (
        isLoading ? (
            <Paper elevation={6} className={classes.loadingPaper}>
                <CircularProgress size="3em"/>
            </Paper>
        )
        : (
            <Grid className={classes.container} container alignItems="stretch" spacing={3}>
                
                { posts.map((post) => (
                    <Grid key={post._id} item xs={12} sm={12} md={6} lg={3}>
                        <Post post={post}/>
                    </Grid>
                ))}

            </Grid>
        )
    );
}

export default Posts;