import { useState } from "react";
import {
	useMediaQuery,
	useTheme,
	Container,
	Grow,
	Grid,
	Paper,
	// AppBar,
	TextField,
	Button,
	Box,
} from "@material-ui/core";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import ChipInput from "material-ui-chip-input";

import Form from "../../components/Form/Form";
import Posts from "../../components/Posts/Posts";
import Pagination from "../../components/Pagination/Pagination";
import useStyles from "./styles";
import { getPostsBySearch } from "../../actions/posts";

const useQuery = () => new URLSearchParams(useLocation().search);

function Home() {
	const classes = useStyles();
	const query = useQuery();
	const history = useHistory();
	const dispatch = useDispatch();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

	const page = query.get("page") || 1;
	const [search, setSearch] = useState("");
	const [tags, setTags] = useState([]);

	const searchPost = () => {
		if (search.trim() || tags.length > 0) {
			dispatch(getPostsBySearch({ search, tags: tags.join(",") }));
			history.push(
				`/posts/search?search=${search || "none"}&tags=${tags.join(",")}`,
			);
		} else {
			history.push("/");
		}
	};

	const handleKeyPress = (event) => {
		if (event.key === "Enter") {
			searchPost();
		}
	};

	return (
		<Grow in>
			<Box mt={isMobile ? 7 : 8}>
				<Container maxWidth="xl">
					<Grid
						container
						spacing={3}
						direction={isMobile ? "column-reverse" : "row"}
						className={classes.gridContainer}
						alignItems="stretch"
					>
						<Grid item xs={12} md={9}>
							<Posts />
						</Grid>
						<Grid item xs={12} md={3}>
							<Paper
								elevation={6}
								className={classes.appBarSearch}
								style={{ marginBottom: 24 }}
							>
								<Box
									display="flex"
									flexDirection="column"
									gap={16}
								>
									<TextField
										name="search"
										variant="outlined"
										label="Search Posts"
										fullWidth
										value={search}
										onKeyPress={handleKeyPress}
										onChange={(e) =>
											setSearch(e.target.value)
										}
										aria-label="Search posts"
										autoFocus
									/>
									<ChipInput
										value={tags}
										onAdd={(tag) => setTags([...tags, tag])}
										onDelete={(tagToDelete) =>
											setTags(
												tags.filter(
													(tag) =>
														tag !== tagToDelete,
												),
											)
										}
										label="Search Tags"
										variant="outlined"
										fullWidth
										aria-label="Search tags"
										style={{ margin: "10px 0" }}
									/>
									<Button
										onClick={searchPost}
										variant="contained"
										color="primary"
										fullWidth
										className={classes.searchButton}
										style={{ marginTop: 8 }}
									>
										Search
									</Button>
								</Box>
							</Paper>
							<Form />
							{!search && !tags.length && (
								<Paper
									elevation={6}
									className={classes.pagination}
									style={{ marginTop: 24 }}
								>
									<Pagination page={page} />
								</Paper>
							)}
						</Grid>
					</Grid>
				</Container>
			</Box>
		</Grow>
	);
}

export default Home;
