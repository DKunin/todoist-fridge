'use strict';

const template = `<div>
        <h2>List</h2>
        <div class="filters">

            <div class="single-filter">
                <select v-model="sort">
                    <option value="">-</option>
                    <option value="desc">A-Z</option>
                    <option value="asc">Z-A</option>
                </select>
            </div>

            <div class="single-filter">
                <select v-model="show">
                    <option value="">all</option>
                    <option v-for="label in labels" :value="label.id">
                        {{ mapLabels(label.name) }}
                    </option>
                </select>
            </div>
        </div>

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
                <div class="fridge-item-name" @dblclick="editItem(item)">{{ item.content }}</div>
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

let syncTimeout = setTimeout(() => {}, 0);

const listPage = {
    computed: {
        itemsList() {
            const { sort, show } = this;

            let sorted;

            if (!Boolean(sort)) {
                sorted = this.$store.state.list.sort(
                    (singleItemA, singleItemB) => {
                        return singleItemA.id > singleItemB.id;
                    }
                );
            }

            sorted = this.$store.state.list.sort((singleItemA, singleItemB) => {
                if (singleItemA.content < singleItemB.content) {
                    return sort === 'desc' ? -1 : 1;
                }
                if (singleItemA.content > singleItemB.content) {
                    return sort === 'desc' ? 1 : -1;
                }
                return 0;
            });
            const filtered = sorted.filter(singleItems => {
                if (show && singleItems.label_ids) {
                    return singleItems.label_ids.includes(show);
                }
                return singleItems;
            });

            return filtered;
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
            clearTimeout(syncTimeout);
            syncTimeout = setTimeout(() => {
                this.$store.commit('sync');
            }, 1000)
        },
        sync(event) {
            this.$store.commit('sync');
        },
        mapLabels(singleLabel) {
            return singleLabel.replace('volume_', '');
        },
        editItem(item) {
            this.$router.push({ path: `/edit/${item.id}`, query: { content: escape(item.content) }})
        }
    },
    data() {
        return {
            sort: this.$store.state.settings.sort,
            show: this.$store.state.settings.show
        };
    },
    watch: {
        sort(newVal, oldVal) {
            this.$store.commit('updateSettings', {
                key: 'sort',
                value: newVal
            });
        },
        show(newVal, oldVal) {
            this.$store.commit('updateSettings', {
                key: 'show',
                value: newVal
            });
        }
    },
    template
};

export default listPage;
