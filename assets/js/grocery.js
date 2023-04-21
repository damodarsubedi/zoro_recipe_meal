function displayEmptyGroceryList() {
    $('.section-card-wrapper.grocery').html(`
        <h5 class="text-center">Grocery list is empty</h5>
        <lottie-player src="https://assets1.lottiefiles.com/packages/lf20_mtojb2nn.json"  background="transparent"  speed="1"  style="width: 800px; height: 800px; postition:center;"  loop  autoplay></lottie-player>
        `);
}

function loadGroceryList() {
    let retrievedGroceryList = loadFromLocalStorage('groceryList');
    let itemRows = '';

    if (!retrievedGroceryList || retrievedGroceryList.length === 0) {
        displayEmptyGroceryList();
        return;
    }

    retrievedGroceryList.forEach(item => {
        itemRows += `
        <div class="row g-0 mb-3 align-items-center" data-index="${retrievedGroceryList.indexOf(item)}">
            <div class="col-2 text-center">
                <input class="item-checkbox" type="checkbox" aria-hidden="true">
            </div>
            <div class="col-5 d-flex justify-content-between grocery-item" contenteditable>
                ${item.name}
            </div>
            <div class="col-4 d-flex justify-content-between grocery-item-qty" contenteditable>
                ${item.quantity}
            </div>
            <div class="col-1">
                <i class="fas fa-trash-alt" aria-label="Delete item from the list"></i>
            </div>
        </div>
        `;
    });
    $('#grocery-list-data').append(itemRows);
    return;
}

function updateGroceryList(index, action, key, value) {
    const retrievedGroceryList = loadFromLocalStorage('groceryList');

    switch (action) {
        case 'edit':
            if (key === 'name') {
                retrievedGroceryList[index].name = value;
                saveToLocalStorage('groceryList', retrievedGroceryList);
                return;
            }
            retrievedGroceryList[index].quantity = value;
            saveToLocalStorage('groceryList', retrievedGroceryList);
            break;

        case 'remove':
            retrievedGroceryList.splice(index, 1);
            saveToLocalStorage('groceryList', retrievedGroceryList);
            break;

        default:
            break;
    }
}

function handleContentEditable() {
    // show edit icon upon hovering over content editable fields
    $(this).mouseenter(function() {
        $(this).append('<i class="fas fa-edit d-inline"></i>');
    });
    $(this).mouseleave(function() {
        $(this).children('i').remove();
    });

    $(this).blur(function() {
        const itemIndex = Number($(this).closest('div[data-index]').attr('data-index'));

        if ($(this).hasClass('grocery-item')) {
            updateGroceryList(itemIndex, 'edit', 'name', this.innerText);
            return;
        }

        updateGroceryList(itemIndex, 'edit', 'quantity', this.innerText);
        return;
    });
}

function removeGroceryItems(removeBtns) {
    removeBtns.each(function() {
        $(this).on('click', function() {
            const itemIndex = Number($(this).closest('div[data-index]').attr('data-index'));
            updateGroceryList(itemIndex, 'remove');
            $(this).parents()[1].remove();
        });
    });
}

function crossGroceryItem(checkboxes) {
    checkboxes.each(function() {
        $(this).on('click', function() {
            $(this).parent().next().toggleClass('strikethrough').next().toggleClass('strikethrough');
        });
    });
}

function resetGroceryList() {
    $('button.btn-reset').on('click', function() {
        displayEmptyGroceryList();
        localStorage.removeItem('groceryList');
    });
}

function activateButtons() {
    let checkboxes = $('.item-checkbox');
    let itemEditable = $('.grocery-item');
    let qtyEditable = $('div.grocery-item-qty');
    let removeBtns = $('i.fa-trash-alt');

    crossGroceryItem(checkboxes);
    itemEditable.each(handleContentEditable);
    qtyEditable.each(handleContentEditable);
    removeGroceryItems(removeBtns);
    resetGroceryList();
}

$(document).ready(function() {
    loadGroceryList(); // 
    activateButtons(); // activate actions for grocery list items
});