'use strict';

const template = `<div>
        <h2 v-if="!$route.query.content">New Item</h2>
        <h2 v-if="$route.query.content">Edit Item</h2>
        <form @submit="handleSubmit">
            <input v-model="name" type="text" />
            <button class="button">
                <span v-if="!$route.query.content">Add</span>
                <span v-if="$route.query.content">Save</span>
            </button>
            <button @click="remove" v-if="$route.query.content" class="button" type="button">
                Remove
            </button>
        </form>
    </div>`;

const newItemPage = {
    mounted() {},
    methods: {
        handleSubmit(event) {
            event.preventDefault();
            if (!this.name) {
                return;
            }
            if (this.$route.params.itemId) {
                this.$store.dispatch('updateItem', {
                    itemId: this.$route.params.itemId,
                    content: this.name.trim()
                });
                this.$router.push({ path: '/' });
                return;
            }
            this.$store.dispatch('addNewItem', this.name.trim());
        },
        remove(event) {
            event.preventDefault();
            this.$store.dispatch('removeItem', this.$route.params.itemId);
            this.$router.push({ path: '/' });
        }
    },
    data() {
        return {
            name: this.$route.query.content || null
        };
    },
    template
};

export default newItemPage;
