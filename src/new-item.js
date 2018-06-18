'use strict';

const template = `<div>
        <form @submit="handleSubmit">
            <div class="row">
                <div class="column">
                    <input v-model="name" type="text" />
                </div>
            </div>

            <div class="row center">
                <div class="column center">
                    <button class="btn">
                        <span v-if="!$route.query.content">Add</span>
                        <span v-if="$route.query.content">Save</span>
                    </button>
                    <button @click="remove" v-if="$route.query.content" class="btn outline" type="button">
                        Remove
                    </button>
                </div>
            </div>
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
            setTimeout(() => {
                this.$store.dispatch('fetchTasks');
            }, 1000)
            this.$router.push({ path: '/' });

        },
        remove(event) {
            event.preventDefault();
            this.$store.dispatch('removeItem', this.$route.params.itemId);
            this.$router.push({ path: '/' });
        }
    },
    data() {
        return {
            name: this.$route.query.content ? unescape(this.$route.query.content) : null
        };
    },
    template
};

export default newItemPage;
