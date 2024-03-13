/* eslint-disable no-param-reassign, */

const addTitles = (titleName) => {
  const container = document.createElement('div');
  const containerForTitle = document.createElement('div');
  const title = document.createElement('h2');
  const list = document.createElement('ul');

  container.classList.add('card', 'border-0');
  containerForTitle.classList.add('card-body');

  title.classList.add('card-title', 'h4');
  list.classList.add('list-group', 'border-0', 'rounded-0');

  title.textContent = titleName;

  containerForTitle.append(title);
  container.append(containerForTitle, list);

  return container;
};

const renderFeeds = (feeds) => {
  const list = document.querySelector('.feeds > .card > ul');

  feeds.forEach((feed) => {
    const item = document.createElement('li');
    const title = document.createElement('h3');
    const description = document.createElement('p');

    item.classList.add('list-group-item', 'border-0', 'border-end-0');
    title.classList.add('h6', 'm-0');
    description.classList.add('m-0', 'small', 'text-black-50');

    title.textContent = feed.title;
    description.textContent = feed.description;

    item.append(title, description);
    list.prepend(item);
  });
};

const renderPosts = (posts, initialState, i18nInstance) => {
  const list = document.querySelector('.posts > .card > ul');

  posts.forEach(({
    title, link, id,
  }) => {
    const item = document.createElement('li');
    const titleElement = document.createElement('a');
    const button = document.createElement('button');

    item.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    if (initialState.ui.clickedPostsIds.includes(id)) {
      titleElement.classList.add('fw-normal', 'link-secondary');
    } else {
      titleElement.classList.add('fw-bold');
    }

    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');

    titleElement.setAttribute('href', `${link}`);
    titleElement.setAttribute('data-id', `${id}`);
    titleElement.setAttribute('target', '_blank');
    titleElement.setAttribute('rel', 'noopener noreferrer');

    button.setAttribute('type', 'button');
    button.setAttribute('data-id', `${id}`);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.setAttribute('data-name', 'view');

    titleElement.textContent = title;
    button.textContent = i18nInstance.t('buttons.view');

    item.append(titleElement, button);
    list.prepend(item);
  });
};

const renderMessageError = (initialState, elements, i18nInstance, path) => {
  const currentProcess = path.replace('.status', '');
  const errorCode = initialState[currentProcess].error;

  elements.mainInterface.input.classList.add('is-invalid');
  elements.textFeedback.classList.remove('text-success');
  elements.textFeedback.classList.add('text-danger');
  elements.textFeedback.textContent = i18nInstance.t(errorCode);
};

const renderMessageSuccess = (elements, i18nInstance) => {
  elements.mainInterface.input.classList.remove('is-invalid');
  elements.form.reset();
  elements.mainInterface.input.focus();
  elements.textFeedback.classList.remove('text-danger');
  elements.textFeedback.classList.add('text-success');
  elements.textFeedback.textContent = i18nInstance.t('feedback.success');
};

// TODO
// const renderMessageLoading = (elements, i18nInstance) => {
//   elements.mainInterface.input.classList.remove('is-invalid');
//   elements.textFeedback.classList.remove('text-danger', 'text-success');
//   elements.textFeedback.textContent = i18nInstance.t('feedback.loading');
// };

const toggleFormDisable = (elements) => {
  const button = elements.buttons.add;
  const { input } = elements.mainInterface;

  button.toggleAttribute('disabled');
  input.toggleAttribute('readonly');
};

const handleFormRender = (elements, initialState, i18nInstance, path, value) => {
  switch (value) {
    case 'starting':
      toggleFormDisable(elements);
      break;

    case 'success':
      toggleFormDisable(elements);
      break;

    case 'uploadError':
      renderMessageError(initialState, elements, i18nInstance, path);
      toggleFormDisable(elements);
      break;

    default:
      toggleFormDisable(elements);
      break;
  }
};

const handleRenderMessages = (elements, initialState, i18nInstance, path, value) => {
  switch (value) {
    case 'sending':
      // renderMessageLoading(elements, i18nInstance); // TODO
      break;

    case 'sent':
      renderMessageSuccess(elements, i18nInstance);
      break;

    case 'validationError':
      renderMessageError(initialState, elements, i18nInstance, path);
      break;

    default:
      break;
  }
};

const handleModal = (elements, initialState, value) => {
  const currentPost = document.querySelector(`[data-id="${value}"]`);
  const { posts } = initialState.content;
  const currentPostData = posts.find(({ id }) => id === value);
  const { title, description, link } = currentPostData;

  currentPost.classList.remove('fw-bold');
  currentPost.classList.add('fw-normal', 'link-secondary');

  elements.modal.title.textContent = title;
  elements.modal.body.textContent = description;
  elements.modal.fullArticle.setAttribute('href', `${link}`);
};

const cleanContentAndRenderTitles = (elements, i18nInstance, path) => {
  const source = path.replace('content.', '');
  elements.content[source].textContent = '';
  elements.content[source].append(addTitles(i18nInstance.t(`mainInterface.${source}Title`)));
};

export default (elements, initialState, i18nInstance) => (path, value) => {
  switch (path) {
    case 'loadingProcess.status':
      handleFormRender(elements, initialState, i18nInstance, path, value);
      break;

    case 'form.status':
      handleRenderMessages(elements, initialState, i18nInstance, path, value);
      break;

    case 'ui.activePostId':
      handleModal(elements, initialState, value);
      break;

    case 'content.feeds':
      cleanContentAndRenderTitles(elements, i18nInstance, path);
      renderFeeds(initialState.content.feeds);
      break;

    case 'content.posts':
      cleanContentAndRenderTitles(elements, i18nInstance, path);
      renderPosts(initialState.content.posts, initialState, i18nInstance);
      break;

    case 'lng':
      // TODO в i18next.t() вместо `buttons...` и `mainInterface` надо подставлять подходящее имя.
      // Могу ли я взять имя из названия константы объекта?

      const changeLanguage = (els, category) => {
        Object.keys(els).forEach((el) => {
          try {
            const hasTextContent = !!els[el].textContent;
            if (hasTextContent) {
              els[el].textContent = i18nInstance.t(`${category}.${el}`); // FIXME (см. TODO выше)
            }
          } catch (err) { console.error(err) }
        });
      };

      const viewButtons = document.querySelectorAll('[data-name="view"]');

      const feedsTitle = document.querySelector('.feeds > .card > .card-body > .card-title');
      const postsTitle = document.querySelector('.posts > .card > .card-body > .card-title');

      const buttons = { ...viewButtons, ...elements.buttons };
      const mainInterface = elements.mainInterface;
      const feedsAndPostsTitles = { feedsTitle, postsTitle };

      const mapping = {
        mainInterface: changeLanguage(mainInterface, 'mainInterface'),
        buttons: changeLanguage(buttons, 'buttons'),
        feedsAndPostsTitles: changeLanguage(feedsAndPostsTitles, 'feedsAndPostsTitles'),
      }

      mapping['mainInterface'];
      mapping['buttons'];
      mapping['feedsAndPostsTitles']; // TODO внутри i18next перенести postsTitle и feedsTitle в отдельную группу
      break;

    default:
      break;
  }
};
