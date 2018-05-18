'use strict';

const template = `<div>
        <h2>List</h2>

        <ul class="items-list">
            <li v-for="item in itemsList" class="fridge-item">
                <form @change="handleChange">
                    <label v-for="label in labels">
                        <input
                            class="item-status-icon"
                            :checked="item.volume === label.id.toString() || (item.volume ===  undefined && item.label_ids && item.label_ids.includes(label.id))" type="radio"
                            :name="item.id"
                            :value="label.id"/>
                        <span :class="label.name"></span>
                    </label>
                </form>
                <div class="fridge-item-name">{{ item.content }}</div>
            </li>
        </ul>
        <button @click="sync" class="button" :disabled="loadingStatus === 'loading'">
            <span v-if="loadingStatus === 'saved'">
                Update
            </span>
            <span v-if="loadingStatus === 'loading'">
                Updating
            </span>
        </button>
    </div>`;

const listPage = {
    computed: {
        itemsList() {
            return this.$store.state.list;
        },
        labels() {
            return this.$store.state.labels;
        },
        loadingStatus() {
            return this.$store.state.loadingStatus;
        }
    },
    methods: {
        handleChange(event) {
            this.$store.commit('updateVolume', {
                id: event.target.name,
                value: event.target.value
            });
        },
        sync(event) {
            this.$store.commit('sync');
        }
    },
    data() {
        return {

        };
    },
    template
};

export default listPage;
