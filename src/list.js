'use strict';

const template = `<div>
        <h2>List</h2>

        <ul>
            <li v-for="item in itemsList" class="fridge-item">
                <div>{{ item.content }}</div>
                <form @change="handleChange">
                    <label v-for="label in labels">
                        {{ label.name }}
                        <input :checked="item.volume === label.id.toString() || item.label_ids.includes(label.id)" type="radio" :name="item.id" :value="label.id"/>
                    </label>
                </form>
            </li>
        </ul>
        <button @click="sync">Update</button>
    </div>`;

const listPage = {
    computed: {
        itemsList() {
            return this.$store.state.list;
        },
        labels() {
            return this.$store.state.labels;
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
