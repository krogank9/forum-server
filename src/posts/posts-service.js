const UsersService = require('../users/users-service');

const PostsService = {
    // Info from UsersService is pulled in to return relevant information for when displaying a thread to the user
    addInfoToPosts(knex, posts) {
        if(!posts)
            return posts
        
        let p = Array.isArray(posts) ? posts : [posts]

        p = p.map(post => {
            return UsersService.getById(knex, post.author_id).then(user => {
                return { ...post, author_name: user.user_name, author_picture: user.profile_picture };
            })
        })

        return Array.isArray(posts) ? Promise.all(p) : p[0]
    },
    getAllPosts(knex, threadId) {
        if (threadId)
            return this.getAllPostsInThread(knex, threadId)
        else
            return knex.select('*').from('posts').then(posts => this.addInfoToPosts(knex, posts))
    },
    countPostsInThread(knex, threadId) {
        return knex.from('posts').count('id').where('thread_id', threadId).first().then(c => parseInt(c.count))
    },
    getAllPostsInThread(knex, threadId) {
        return knex.from('posts').select('*').where('thread_id', threadId).then(posts => {
            return this.addInfoToPosts(knex, posts)
        })
    },
    insertPost(knex, newPost) {
        return knex
            .insert(newPost)
            .into('posts')
            .returning('*')
            .then(rows => {
                return this.addInfoToPosts(knex, rows[0])
            })
    },
    getById(knex, id) {
        id = parseInt(id) || 0
        return knex.from('posts').select('*').where('id', id).first().then(post => this.addInfoToPosts(knex, post))
    },
    deletePost(knex, id) {
        return knex('posts')
            .where({ id })
            .delete()
    },
    updatePost(knex, id, newPostFields) {
        return knex('posts')
            .where({ id })
            .update(newPostFields)
    },
}

module.exports = PostsService